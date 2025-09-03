from rest_framework import serializers

from categories.models import Category
from ..models import TestSessionQuestion, TestSession
from ..serializers import TestAssessmentSerializer
from .question import QuestionDisplaySerializer


class StartTestSessionSerializer(serializers.Serializer):
    category = serializers.CharField()
    difficulty = serializers.CharField()

    def validate_category(self, value):
        if not Category.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid category_id")
        return value
    
    def validate_difficulty(self, value):
        if value not in ["EASY", "NORMAL", "DIFFICULTY"]:
            return serializers.ValidationError("Invalid difficulty type.")
        return value


class TestSessionQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = TestSessionQuestion
        fields = [
            "order",
        ]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep.update(QuestionDisplaySerializer(instance.question).data)
        return rep
    

class TestSessionSerializer(serializers.ModelSerializer):
    test_assessment = TestAssessmentSerializer()

    class Meta:
        model = TestSession
        fields = [
            "id",
            "test_assessment",
            "status",
            "score",
            "submitted_at",
            "is_expired",
        ]
