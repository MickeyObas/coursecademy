from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from models import Question


class QuestionListCreateView(generics.ListCreateAPIView):
    pass