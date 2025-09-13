from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.permissions import IsAdminInstructorOrReadOnly

from ..models import Option, Question
from ..serializers import OptionSerializer, QuestionSerializer


# Check which situations I'm fetching questions anyway
class QuestionListCreateView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAdminInstructorOrReadOnly]
    queryset = Question.objects.all()


class OptionCreateView(APIView):
    serializer_class = OptionSerializer
    queryset = Option.objects.all()
    permission_classes = [IsAdminInstructorOrReadOnly]

    def post(self, request, *args, **kwargs):
        serializer = OptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
