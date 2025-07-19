from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from ..models import Question
from ..serializers import QuestionSerializer


class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Question.objects.all()