from rest_framework import serializers

from .models import Course, CourseLearningPoint, CourseSkill, Module, Lesson, LessonProgress, ModuleProgress
from users.serializers import UserSerializer
from categories.serializers import CategorySerializer


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "type",
            "content",
            "order",
            "description"
        ]


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True)
    class Meta:
        model = Module
        fields = ["id", "order", "title", "description", "lessons"]


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

    def get_course(self, obj):
        return {
            'id': obj.id,
            'title': obj.title,
            'slug': obj.slug
        }

    def get_progress(self, obj):
        user = self.context['request'].user

        module_ids = Module.objects.filter(course_id=obj.id).values_list('id', flat=True)
        lesson_ids = Lesson.objects.filter(module_id__in=module_ids).values_list('id', flat=True)
        lesson_total = len(lesson_ids)
        module_total = len(module_ids)
    
        lesson_completed = LessonProgress.objects.filter(
            user=user,
            completed_at__isnull=False,
            lesson_id__in=lesson_ids
        ).count()
        module_completed = ModuleProgress.objects.filter(
            user=user,
            completed_at__isnull=False,
            module_id__in=module_ids
        ).count()

        lesson_part = lesson_completed / lesson_total if lesson_total else 0
        module_part = module_completed / module_total if module_total else 0
        lesson_weight = 0.7
        module_weight = 0.3

        total_progress = (lesson_part * lesson_weight) + (module_part * module_weight)
        total_progress_percentage = round(total_progress * 100, 2)
        
        return {
            'percentage': total_progress_percentage,
            'lesson': lesson_completed,
            'module': module_completed
        }

    pass