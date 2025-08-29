from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from rest_framework import serializers

from assessments.models import Option, Question, LessonAssessment, CourseAssessment
from courses.models import Lesson, Course


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["question", "text", "is_correct"]
        extra_kwargs = {"question": {"read_only": True}}


class QuestionDetailsSerializer(serializers.Serializer):
    options = OptionSerializer(many=True, required=False)
    correct_answer = serializers.CharField(required=False, allow_blank=True)
    is_true = serializers.BooleanField(required=False)

    def validate(self, attrs):
        question_type = self.context.get("question_type")

        if question_type == "MCQ":
            if not attrs.get("options") or len(attrs.get("options", [])) < 4:
                raise serializers.ValidationError(
                    {"options": "MCQ questions require at least four options."}
                )

        elif question_type == "FIB":
            if not attrs.get("correct_answer"):
                raise serializers.ValidationError(
                    {"correct_answer": "FIB questions require a correct answer."}
                )

        elif question_type == "TF":
            if "is_true" not in attrs:
                raise serializers.ValidationError(
                    {"is_true": "TF questions must specify true/false."}
                )

        return attrs


class QuestionSerializer(serializers.ModelSerializer):
    assessment_type = serializers.SerializerMethodField()
    assessment_type_input = serializers.CharField(write_only=True)
    lesson_id = serializers.CharField(write_only=True, required=False)
    course_id = serializers.CharField(write_only=True, required=False)
    assessment_id = serializers.SerializerMethodField()
    details = QuestionDetailsSerializer(write_only=True)

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
            "order",
            "details",
            # "content_type",
            "object_id",
            "assessment_type",
            "assessment_type_input",
            "assessment_id",
            "lesson_id", 
            "course_id"
        ]
        extra_kwargs = {
            "category": {"read_only": True}
        }

    def validate(self, data):
        details_serializer = QuestionDetailsSerializer(
            data=self.initial_data.get("details", {}),
            context={"question_type": data.get("type")}
        )
        details_serializer.is_valid(raise_exception=True)
        data["details"] = details_serializer.validated_data
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
        details = validated_data.pop('details', {})
        assessment_type = validated_data.pop('assessment_type_input', None)
        
        if assessment_type == "lesson":
            lesson_id = validated_data.pop('lesson_id', None)
            if not lesson_id:
                raise serializers.ValidationError({"lesson_id": "This field is required for lesson assessments"})
            try:
                lesson = Lesson.objects.get(id=lesson_id)
            except Lesson.DoesNotExist:
                raise serializers.ValidationError({"lesson_id": f"Lesson {lesson_id} does not exist"})
            target = lesson.lessonassessment
            category = lesson.module.course.category
            ct = ContentType.objects.get_for_model(LessonAssessment)

        elif assessment_type == "course":
            course_id = validated_data.pop('course_id', None)
            if not course_id:
                raise serializers.ValidationError({"course_id": "This field is required for course assessments"})
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                raise serializers.ValidationError({"course_id": f"Course {course_id} does not exist"})
            target = course.courseassessment
            category = course.category
            ct = ContentType.objects.get_for_model(CourseAssessment)

        with transaction.atomic():
            question = Question.objects.create(
                content_type=ct, 
                object_id=target.id,
                category=category,
                **validated_data
                )

            if question.type == "MCQ":
                options_data = details.get('options', [])
                if len(options_data) < 4:
                    raise serializers.ValidationError({"details": "MCQ questions must have at least four options"})
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
        
        details = validated_data.get('details', {})

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            instance.save()

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
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["details"] = self.get_details(instance)
        return rep


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


class PublicOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "text"]