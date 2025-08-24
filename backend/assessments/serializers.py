from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from categories.serializers import CategorySerializer

from .models import (AssessmentAnswer, AssessmentQuestion, AssessmentSession,
                     Option, Question, TestAssessment, TestSession,
                     TestSessionQuestion, LessonAssessment)
from courses.models import Lesson
from categories.models import Category


class QuestionSerializer(serializers.ModelSerializer):
    # content_type = serializers.CharField(write_only=True, required=False)
    # object_id = serializers.IntegerField(write_only=True, required=False)
    assessment_type = serializers.SerializerMethodField()
    assessment_type_input = serializers.CharField(write_only=True)
    lesson_id = serializers.CharField(write_only=True, required=False)
    assessment_id = serializers.SerializerMethodField()
    details = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
            "id",
            "type",
            "category",
            "difficulty",
            "text",
            "explanation",
            "is_active",
            "is_true",
            "correct_answer",
            "order",
            "details",
            "content_type",
            "object_id",
            "assessment_type",
            "assessment_type_input",
            "assessment_id",
            "lesson_id"
        ]
        extra_kwargs = {
            "is_true": {"write_only": True},
            "correct_answer": {"write_only": True},
            "category": {"read_only": True}
        }

    def validate(self, data):
        q_type = data.get("type")

        # NOTE: Change back to data later
        details = self.initial_data.get('details', {})

        if (q_type == "FIB") and not details.get("correct_answer"):
            raise serializers.ValidationError(
                "FIB questions must have 'correct_answer' set."
            )

        if (q_type != "FIB") and details.get("correct_answer"):
            raise serializers.ValidationError(
                "Only FIB questions should have a direct 'correct_answer' value set."
            )

        if q_type != "TF" and "is_true" in details:
            raise serializers.ValidationError(
                "Only TF questions should have the 'is_true' flag set"
            )

        if q_type == "TF" and "is_true" not in details:
            raise serializers.ValidationError(
                "TF questions should have the 'is_true' flag set"
            )

        return data

    def get_details(self, obj):
        if obj.type == Question.QuestionTypes.MCQ:
            return MCQDetailSerializer(obj).data
        elif obj.type == Question.QuestionTypes.TF:
            return TFDetailSerializer(obj).data
        elif obj.type == Question.QuestionTypes.FIB:
            return FIBDetailSerializer(obj).data
        return {}

    # To identify what assessment the question belongs to (as opposed to returning content_type + object_id)
    def get_assessment_type(self, obj):
        if obj.assessment_object:
            return obj.assessment_object._meta.model_name
        return None

    def get_assessment_id(self, obj):
        return obj.object_id

    def create(self, validated_data):
        # content_type_model = validated_data.pop("assessment_type")
        # object_id = validated_data.pop("assesssment_id")
        details = self.initial_data.get('details')
        assessment_type = validated_data.pop('assessment_type_input')
        lesson_id = validated_data.pop('lesson_id')

        lesson = Lesson.objects.get(id=lesson_id)


        try:
            ct = ContentType.objects.get_for_model(LessonAssessment)
        except ContentType.DoesNotExist:
            raise serializers.ValidationError(
                {"error": f'Invalid assessment type "{assessment_type}"'}
            )

        with transaction.atomic():
            question = Question.objects.create(
                content_type=ct, 
                object_id=lesson.lessonassessment.id,
                category=lesson.module.course.category,
                **validated_data
                )

            if question.type == "MCQ":
                options_data = details.get('options', [])
                for option in options_data:
                    Option.objects.create(question=question, **option)

            elif question.type == "FIB":
                question.correct_answer = details.get('correct_answer')
                question.save()

            elif question.type == "TF":
                question.is_true = details.get('is_true')
                question.save()

            return question
        
    def update(self, instance, validated_data):
        
        details = self.initial_data.get('details', {})
    
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
            
        # instance.save()

        if instance.type == "MCQ":
            options_data = details.get('options', [])
            instance.options.all().delete()
            for option in options_data:
                Option.objects.create(question=instance, **option)
        elif instance.type == "TF":
            instance.is_true = True if details.get('is_true') else False
            instance.save()
        elif instance.type == "FIB":
            instance.correct_answer = details.get('correct_answer')
            instance.save()

        return instance


class QuestionDisplaySerializer(serializers.ModelSerializer):
    details = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ["id", "type", "text", "details"]

    def get_details(self, obj):
        if obj.type == Question.QuestionTypes.MCQ:
            return PublicMCQDetailSerializer(obj).data
        return None

    def to_representation(self, instance):
        res = super().to_representation(instance)
        if instance.type != "MCQ":
            res.pop("details")
        return res


class MCQDetailSerializer(serializers.Serializer):
    options = serializers.SerializerMethodField()

    def get_options(self, obj):
        return OptionSerializer(obj.options.all(), many=True).data


class PublicMCQDetailSerializer(serializers.Serializer):
    options = serializers.SerializerMethodField()

    def get_options(self, obj):
        return PublicOptionSerializer(obj.options.all(), many=True).data


class TFDetailSerializer(serializers.Serializer):
    is_true = serializers.BooleanField()


class FIBDetailSerializer(serializers.Serializer):
    correct_answer = serializers.CharField()


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["question", "text", "is_correct"]
        extra_kwargs = {"question": {"write_only": True}}


class PublicOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text"]


# Assessment Serializers
class TestAssessmentSerializer(serializers.ModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = TestAssessment
        fields = ["id", "category", "description", "duration_minutes"]


class StartTestSessionSerializer(serializers.Serializer):
    category = serializers.CharField()
    difficulty = serializers.CharField()


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


class AssessmentQuestionSerializer(serializers.Serializer):
    question = serializers.SerializerMethodField()

    def get_question(self, obj):
        return QuestionDisplaySerializer(obj).data


class SaveTestAssessmentAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    test_session_id = serializers.IntegerField()
    answer = serializers.CharField()


class SaveAssessmentAnswerSerializer(serializers.Serializer):
    assessment_type = serializers.CharField()
    question_id = serializers.IntegerField()
    session_id = serializers.IntegerField()
    answer = serializers.CharField()


# Session Serializers
class TestSessionSerializer(serializers.ModelSerializer):
    test_assessment = TestAssessmentSerializer()

    class Meta:
        model = TestSession
        fields = [
            "id",
            "test_assessment",
            "submitted_at",
            "score",
            "status",
            "is_expired",
        ]
