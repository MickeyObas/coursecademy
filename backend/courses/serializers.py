from rest_framework import serializers

from .models import Course, CourseLearningPoint, CourseSkill, Module


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ["order", "title", "description"]


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
        fields = ["id", "title", "category", "average_rating"]
