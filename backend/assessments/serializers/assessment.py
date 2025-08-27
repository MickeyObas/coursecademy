from rest_framework import serializers

from django.contrib.contenttypes.models import ContentType

from .question import QuestionDisplaySerializer
from categories.serializers import CategorySerializer
from assessments.models import TestAssessment, Question, TestSession, LessonAssessment, AssessmentSession


class TestAssessmentSerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = TestAssessment
        fields = ["id", "category", "description", "duration_minutes"]


class SaveTestAssessmentAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    test_session_id = serializers.IntegerField()
    answer = serializers.CharField()

    def validate_question_id(self, value):
        if not Question.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid question_id")
        return value
    
    def validate_test_session_id(self, value):
        if not TestSession.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid test_session_id")


class AssessmentQuestionSerializer(serializers.Serializer):
    question = serializers.SerializerMethodField()

    def get_question(self, obj):
        return QuestionDisplaySerializer(obj).data


class SaveAssessmentAnswerSerializer(serializers.Serializer):
    assessment_type = serializers.CharField()
    question_id = serializers.IntegerField()
    session_id = serializers.IntegerField()
    answer = serializers.CharField()

    def validate_question_id(self, value):
        if not Question.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid question_id")
        return value
    
    def validate_assessment_type(self, value):
        if value not in {"lesson", "course"}:
            raise serializers.ValidationError("Invalid assessment type")
        return value
    
    def validate_session_id(self, value):
        if self.initial_data.get('assessment_type', '') == "lesson":
            if not AssessmentSession.objects.filter(
                content_type=ContentType.objects.get_for_model(LessonAssessment),
                object_id=value
            ).exists():
                raise serializers.ValidationError("Invalid session ID")
        return value