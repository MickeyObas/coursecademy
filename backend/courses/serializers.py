import logging

from django.db import transaction
from rest_framework import serializers

from assessments.models import LessonAssessment
from categories.models import Category
from categories.serializers import CategorySerializer
from enrollments.models import Enrollment
from users.serializers import UserSerializer

from .models import (Course, CourseLearningPoint, CourseProgress, CourseSkill,
                     Lesson, LessonProgress, Module, ModuleProgress)

logger = logging.getLogger(__name__)


class LessonListSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    has_assessment = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "order",
            "is_unlocked",
            "has_assessment",
            "type",
            "status",
        ]

    def get_has_assessment(self, obj):
        return LessonAssessment.objects.filter(lesson=obj).exists()

    def get_is_unlocked(self, obj):
        user = self.context["request"].user
        if not user.is_authenticated:
            return False

        prev_lessons = Lesson.objects.filter(
            module=obj.module,
            order__lt=obj.order,
        )
        if prev_lessons.exists():
            if LessonProgress.objects.filter(
                enrollment__user=user,
                lesson__in=prev_lessons,
                completed_at__isnull=True,
            ).exists():
                return False

        prev_modules = Module.objects.filter(
            course=obj.module.course, order__lt=obj.module.order
        )
        if prev_modules.exists():
            if LessonProgress.objects.filter(
                enrollment__user=user,
                lesson__module__in=prev_modules,
                completed_at__isnull=True,
            ).exists():
                return False

        return True

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        # logging.info(f"{request.user} --- {instance.module.course.instructor}")

        if request and request.user == instance.module.course.instructor:
            if instance.video_file:
                rep["video_file"] = instance.video_file.url
            elif instance.type == "ARTICLE":
                rep["content"] = instance.content
                rep["draft_content"] = instance.draft_content
                rep["updated_at"] = instance.updated_at

        return rep


class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    has_assessment = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "type",
            "content",
            "order",
            "description",
            "is_completed",
            "is_unlocked",
            "has_assessment",
            "video_file",
            "status",
        ]

    def get_video_file(self, obj):
        request = self.context.get("request")
        # Temporary change for video lessons served via NGINX
        if obj.video_file:
            return f"http://localhost:8080/media/{obj.video_file.name}"
        return None

    def get_has_assessment(self, obj):
        return LessonAssessment.objects.filter(lesson=obj).exists()

    def get_is_unlocked(self, obj):
        user = self.context["request"].user

        prev_modules = Module.objects.filter(
            course=obj.module.course, order__lt=obj.module.order
        )
        if prev_modules.exists():
            if LessonProgress.objects.filter(
                enrollment__user=user,
                lesson__module__in=prev_modules,
                completed_at__isnull=True,
            ).exists():
                return False

        return True

    def get_is_completed(self, obj):
        user = self.context["request"].user
        is_completed = LessonProgress.objects.filter(
            enrollment__user=user, lesson=obj, completed_at__isnull=False
        ).exists()
        return is_completed

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.type == "ARTICLE":
            data.pop("video_file")
        else:
            data.pop("content")

        return data


class LessonInstructorSerializer(LessonSerializer):
    class Meta(LessonSerializer.Meta):
        fields = LessonSerializer.Meta.fields + ["draft_content"]


class LessonUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["title", "type", "draft_content", "description", "video_file"]

    def validate(self, attrs):
        lesson_type = attrs.get("lesson_type")

        if lesson_type == "ARTICLE" and not attrs.get("draft_content"):
            raise serializers.ValidationError("Lesson articles must have content")

        if lesson_type == "VIDEO" and not attrs.get("video_file"):
            raise serializers.ValidationError("Lesson videos must have URLs")

        return attrs

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters")
        return value

    def validate_type(self, value):
        if value not in ["ARTICLE", "VIDEO"]:
            raise serializers.ValidationError("Invalid lesson type")
        return value


class ModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "order", "title", "description", "lessons"]

    def get_lessons(self, obj):
        return LessonListSerializer(
            obj.lessons.all(), context=self.context, many=True
        ).data


class ModuleCreateSerializer(serializers.ModelSerializer):
    course_id = serializers.CharField()

    class Meta:
        model = Module
        fields = [
            "course_id",
            "title",
            "description",
        ]

    def validate_course_id(self, value):
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid course_id")
        return value

    def validate_title(self, value):
        if len(value) < 5:
            raise serializers.ValidationError(
                "Module title must be at least 6 characters"
            )
        return value

    def create(self, validated_data):
        course_id = validated_data.pop("course_id")
        course = Course.objects.get(id=course_id)
        last_module = course.modules.order_by("order").last()

        new_module = Module.objects.create(
            course=course,
            order=last_module.order + 1 if last_module else 1,
            **validated_data,
        )
        return new_module


class LessonCreateSerializer(serializers.ModelSerializer):
    module_id = serializers.CharField()
    course_id = serializers.CharField()

    class Meta:
        model = Lesson
        fields = [
            "title",
            "description",
            "type",
            "content",
            "module_id",
            "course_id",
            "video_file",
        ]

    def validate(self, attrs):
        lesson_type = attrs.get("lesson_type")

        if lesson_type == "ARTICLE" and not attrs.get("content"):
            raise serializers.ValidationError("Lesson articles must have content")

        if lesson_type == "VIDEO" and not attrs.get("video_file"):
            raise serializers.ValidationError("Lesson videos must have URLs")

        return attrs

    def validate_module_id(self, value):
        if not Module.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid module_id")
        return value

    def validate_course_id(self, value):
        if not Course.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid course_id")
        return value

    def create(self, validated_data):
        module_id = validated_data.pop("module_id")
        course_id = validated_data.pop("course_id")
        module = Module.objects.get(id=module_id, course_id=course_id)

        # Get last lesson's order/positon in the module
        if module.lessons.count() > 0:
            last_lesson_pos = module.lessons.order_by("order").last().order
        else:
            last_lesson_pos = 0

        lesson = Lesson.objects.create(
            module=module, order=last_lesson_pos + 1, **validated_data
        )

        return lesson


class CourseLearningPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseLearningPoint
        fields = ["text"]


class CourseSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSkill
        fields = ["name"]


class CourseSerializer(serializers.ModelSerializer):
    learning_points = CourseLearningPointSerializer(many=True, read_only=True)
    learning_points_input = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )
    skills = CourseSkillSerializer(many=True, required=False)
    skills_input = serializers.ListField(child=serializers.CharField(), write_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    instructor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )
    resume_lesson_id = serializers.SerializerMethodField()
    first_lesson_id = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField(
        source="course.enrollment_count"
    )
    rating_count = serializers.SerializerMethodField(source="course.rating_count")
    average_rating = serializers.SerializerMethodField(source="course.acerage_rating")

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_id",
            "instructor",
            "thumbnail",
            "modules",
            "is_active",
            "tags",
            "rating_count",
            "average_rating",
            "enrollment_count",
            "price",
            "learning_points",
            "learning_points_input",
            "skills",
            "skills_input",
            "resume_lesson_id",
            "lesson_count",
            "module_count",
            "is_enrolled",
        ]

    def get_enrollment_count(self, obj):
        return obj.enrollment_count

    def get_rating_count(self, obj):
        return obj.rating_count

    def get_average_rating(self, obj):
        return obj.average_rating

    def create(self, validated_data):
        learning_points_data = validated_data.pop("learning_points_input", [])
        skills_data = validated_data.pop("skills_input", [])
        user = self.context.get("request").user

        with transaction.atomic():
            course = Course.objects.create(**validated_data, instructor=user)

            for lp in learning_points_data:
                CourseLearningPoint.objects.create(course=course, text=lp)

            for skill in skills_data:
                CourseSkill.objects.create(course=course, name=skill)

            return course

    def get_is_enrolled(self, obj):
        user = self.context["request"].user
        return Enrollment.objects.filter(user=user, course=obj).exists()

    def get_learning_points(self, obj):
        return [lp.text for lp in obj.learning_points.all()]

    def get_skills(self, obj):
        return [skill.name for skill in obj.skills.all()]

    def get_resume_lesson_id(self, obj):
        user = self.context["request"].user
        current_lesson_progress = (
            LessonProgress.objects.filter(
                enrollment__user=user,
                enrollment__course=obj,
                last_accessed_at__isnull=False,
            )
            .order_by("-last_accessed_at")
            .first()
        )
        if current_lesson_progress:
            return current_lesson_progress.lesson.id

        first_lesson = (
            Lesson.objects.filter(module__course=obj)
            .order_by("module__order", "order")
            .first()
        )

        return first_lesson.id if first_lesson else None

    def first_lesson_id(self, obj):
        qs = Lesson.objects.filter(module__course=obj).order_by(
            "module__order", "order"
        )
        if qs.exists():
            first_lesson = qs.first()
            return first_lesson.id
        return None

    # def get_lesson_count(self, obj):
    #     return Lesson.objects.filter(module__course=obj).count()

    # def get_module_count(self, obj):
    #     return obj.modules.count()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["learning_points"] = [lp["text"] for lp in rep["learning_points"]]
        rep["skills"] = [skill["name"] for skill in rep["skills"]]
        return rep


class ThinCourseSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.title")

    class Meta:
        model = Course
        fields = ["id", "title", "slug", "category", "average_rating"]


class CourseUserSerializer(serializers.Serializer):
    course = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    resume_lesson_id = serializers.SerializerMethodField()
    last_accessed_at = serializers.SerializerMethodField()

    def get_last_accessed_at(self, obj):
        request = self.context["request"]
        course_progress = CourseProgress.objects.get(
            enrollment__user=request.user, enrollment__course=obj
        )
        return course_progress.last_accessed_at

    def get_course(self, obj):
        request = self.context["request"]
        return {
            "id": obj.id,
            "title": obj.title,
            "category": obj.category.title,
            "thumbnail": request.build_absolute_uri(obj.thumbnail.url),
            "slug": obj.slug,
            "lesson_count": obj.lesson_count,
            "module_count": obj.module_count,
        }

    def get_progress(self, obj):
        user = self.context["request"].user

        module_ids = Module.objects.filter(course_id=obj.id).values_list(
            "id", flat=True
        )
        lesson_ids = Lesson.objects.filter(module_id__in=module_ids).values_list(
            "id", flat=True
        )
        lesson_total = len(lesson_ids)
        module_total = len(module_ids)

        lesson_completed = LessonProgress.objects.filter(
            enrollment__user=user, completed_at__isnull=False, lesson_id__in=lesson_ids
        ).count()
        module_completed = ModuleProgress.objects.filter(
            enrollment__user=user, completed_at__isnull=False, module_id__in=module_ids
        ).count()

        lesson_part = lesson_completed / lesson_total if lesson_total else 0
        module_part = module_completed / module_total if module_total else 0
        lesson_weight = 0.7
        module_weight = 0.3

        total_progress = (lesson_part * lesson_weight) + (module_part * module_weight)
        total_progress_percentage = round(total_progress * 100, 2)

        return {
            "percentage": total_progress_percentage,
            "lesson": lesson_completed,
            "module": module_completed,
        }

    def get_resume_lesson_id(self, obj):
        user = self.context["request"].user
        current_lesson_progress = (
            LessonProgress.objects.filter(
                enrollment__user=user,
                enrollment__course=obj,
                last_accessed_at__isnull=False,
            )
            .order_by("-last_accessed_at")
            .first()
        )
        if current_lesson_progress:
            return current_lesson_progress.lesson.id

        first_lesson = (
            Lesson.objects.filter(module__course=obj)
            .order_by("module__order", "order")
            .first()
        )

        return first_lesson.id if first_lesson else None
