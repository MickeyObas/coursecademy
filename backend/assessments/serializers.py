from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from .models import Option, Question, TestSessionQuestion


class QuestionSerializer(serializers.ModelSerializer):
    content_type = serializers.CharField(write_only=True)
    object_id = serializers.IntegerField(write_only=True)
    assessment_type = serializers.SerializerMethodField()
    assessment_id = serializers.SerializerMethodField()
    details = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [
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
            "assessment_id",
        ]
        extra_kwargs = {
            "is_true": {"write_only": True},
            "correct_answer": {"write_only": True},
        }

    def validate(self, data):
        q_type = data.get("type")
        print(data)

        if (q_type == "FIB") and not data.get("correct_answer"):
            raise serializers.ValidationError(
                "FIB questions must have 'correct_answer' set."
            )

        if (q_type != "FIB") and data.get("correct_answer"):
            raise serializers.ValidationError(
                "Only FIB questions should have a direct 'correct_answer' value set."
            )

        if q_type != "TF" and "is_true" in data:
            raise serializers.ValidationError(
                "Only TF questions should have the 'is_true' flag set"
            )

        if q_type == "TF" and "is_true" not in data:
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
        content_type_model = validated_data.pop("content_type")
        object_id = validated_data.pop("object_id")

        try:
            ct = ContentType.objects.get(model=content_type_model.lower())
        except ContentType.DoesNotExist:
            raise serializers.ValidationError(
                {"error": f'Invalid assessment type "{content_type_model}"'}
            )

        question = Question.objects.create(
            content_type=ct, object_id=object_id, **validated_data
        )

        return question


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


class StartTestSessionSerializer(serializers.Serializer):
    category = serializers.CharField()
    difficulty = serializers.CharField()


class TestSessionQuestionSerializer(serializers.ModelSerializer):
    question = QuestionDisplaySerializer()

    class Meta:
        model = TestSessionQuestion
        fields = [
            "order",
            "question",
        ]


class SaveTestAssessmentAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    test_session_id = serializers.IntegerField()
    answer = serializers.CharField()