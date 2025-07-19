from rest_framework import serializers

from .models import (
    Question
)


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'type',
            'category',
            'difficulty',
            'text',
            'correct_answer',
            'is_true',
            'explanation',
            'is_active',
            'order'
        ]


class QuestionDisplaySerializer(serializers.ModelSerializer):
    class Meta:
        fields = [
            'type'
        ]