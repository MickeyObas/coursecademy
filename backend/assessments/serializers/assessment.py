from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from categories.serializers import CategorySerializer

from ..models import (AssessmentSession, LessonAssessment, Question,
                      TestAssessment, TestSession, AssessmentAnswer, Option)
from .question import QuestionDisplaySerializer


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
        if self.initial_data.get("assessment_type", "") == "lesson":
            if not AssessmentSession.objects.filter(
                content_type=ContentType.objects.get_for_model(LessonAssessment),
                id=value,
            ).exists():
                raise serializers.ValidationError("Invalid session ID")
        return value


class SubmitAssessmentSessionSerializer(serializers.Serializer):
    session_id = serializers.CharField()
    assessment_id = serializers.CharField()
    assessment_type = serializers.CharField()


class AsssessmentResultSerializer(serializers.ModelSerializer):
    user_answer = serializers.SerializerMethodField()
    question_text = serializers.SerializerMethodField()
    correct_answer = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentAnswer
        fields = [
            'question_text',
            'user_answer', # User's answer
            'is_correct',
            'correct_answer'
        ]

    def get_question_text(self, obj):
        return obj.question.text
    
    def get_user_answer(self, obj):
        if obj.question.type == "MCQ":
            if obj.option_id:
                user_option = Option.objects.get(id=obj.option_id)
                return user_option.text
        return obj.input
                
    def get_correct_answer(self, obj):
        if obj.question.type == "MCQ":
            correct_option = Option.objects.filter(
                question=obj.question,
                is_correct=True
            ).first()

            # NOTE Warn about no correct answers set
            return correct_option.text
        elif obj.question.type == "FIB":
            return obj.question.correct_answer
        elif obj.question.type == "TF":
            return "true" if obj.question.is_true else "false"
        
        