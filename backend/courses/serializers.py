from rest_framework import serializers

from assessments.models import LessonAssessment
from categories.serializers import CategorySerializer
from users.serializers import UserSerializer

from .models import (Course, CourseLearningPoint, CourseSkill, Lesson,
                     LessonProgress, Module, ModuleProgress)


class LessonListSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    has_assessment = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "order", "is_unlocked", "has_assessment","type"]

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
                enrollment__user=user, lesson__in=prev_lessons, completed_at__isnull=True
            ).exists():
                return False

        prev_modules = Module.objects.filter(
            course=obj.module.course, order__lt=obj.module.order
        )
        if prev_modules.exists():
            if LessonProgress.objects.filter(
                enrollment__user=user, lesson__module__in=prev_modules, completed_at__isnull=True
            ).exists():
                return False

        return True

class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    has_assessment = serializers.SerializerMethodField()

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
            "video_file"
        ]

    def get_has_assessment(self, obj):
        return LessonAssessment.objects.filter(lesson=obj).exists()

    def get_is_unlocked(self, obj):
        user = self.context["request"].user

        prev_modules = Module.objects.filter(
            course=obj.module.course, order__lt=obj.module.order
        )
        if prev_modules.exists():
            if LessonProgress.objects.filter(
                enrollment__user=user, lesson__module__in=prev_modules, completed_at__isnull=True
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
        if instance.type == 'ARTICLE':
            data.pop('video_file')
        else:
            data.pop('content')

        return data


class ModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "order", "title", "description", "lessons"]

    def get_lessons(self, obj):
        return LessonListSerializer(
            obj.lessons.all(), context=self.context, many=True
        ).data


class CourseLearningPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseLearningPoint
        fields = ["text"]


class CourseSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSkill
        fields = ["name"]


class CourseSerializer(serializers.ModelSerializer):
    learning_points = CourseLearningPointSerializer(many=True)
    skills = CourseSkillSerializer(many=True, required=False)
    modules = ModuleSerializer(many=True, read_only=True)
    instructor = UserSerializer()
    category = CategorySerializer()
    resume_lesson_id = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "category",
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
            "skills",
            "resume_lesson_id"
        ]

    def create(self, validated_data):
        learning_points_data = validated_data.pop("learning_points", [])
        skills_data = validated_data.pop("skills", [])

        course = Course.objects.create(**validated_data)

        # Create learning points
        for lp in learning_points_data:
            CourseLearningPoint.objects.create(course=course, **lp)

        # Create skills
        for skill in skills_data:
            CourseSkill.objects.create(course=course, **skill)

        return course

    def get_learning_points(self, obj):
        return [lp.text for lp in obj.learning_points.all()]

    def get_skills(self, obj):
        return [skill.name for skill in obj.skills.all()]
    
    def get_resume_lesson_id(self, obj):
        user = self.context['request'].user
        current_lesson_progress = (
            LessonProgress.objects
            .filter(enrollment__user=user, enrollment__course=obj)
            .order_by('last_accessed_at')
            .first()
        )
        if current_lesson_progress:
            return current_lesson_progress.lesson.id
        
        first_lesson = Lesson.objects.filter(module__course=obj).order_by("module__order", "order").first()

        return first_lesson.id if first_lesson else None


        pass

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

    def get_course(self, obj):
        request = self.context["request"]
        return {
            "id": obj.id,
            "title": obj.title,
            "category": obj.category.title,
            "thumbnail": request.build_absolute_uri(obj.thumbnail.url),
            "slug": obj.slug,
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
        user = self.context['request'].user
        current_lesson_progress = (
            LessonProgress.objects
            .filter(enrollment__user=user, enrollment__course=obj, last_accessed_at__isnull=False)
            .order_by('-last_accessed_at')
            .first()
        )
        if current_lesson_progress:
            return current_lesson_progress.lesson.id
                
        first_lesson = Lesson.objects.filter(module__course=obj).order_by("module__order", "order").first()

        return first_lesson.id if first_lesson else None
