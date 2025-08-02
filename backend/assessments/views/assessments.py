import logging
import random

from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.models import (Question, TestAssessment, TestBlueprint,
                                TestSession, TestSessionQuestion)
from assessments.serializers import (QuestionSerializer,
                                     StartTestSessionSerializer,
                                     TestSessionQuestionSerializer, TestAssessmentSerializer)

from assessments.services import start_test_session

logger = logging.getLogger(__name__)


class TestAssessmentDetail(generics.RetrieveAPIView):
    serializer_class = TestAssessmentSerializer
    queryset = TestAssessment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'category_id'


class StartTestAssessmentSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):

        data = {
            "category": kwargs.get("category_id"),
            "difficulty": request.data.get("difficulty"),
        }
        print(data)
        serializer = StartTestSessionSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        category = serializer.validated_data["category"]
        difficulty = serializer.validated_data["difficulty"]

        try:
            test_session = start_test_session(request.user, category, difficulty)
            session_questions = TestSessionQuestion.objects.filter(
                test_session=test_session
            )
            data = TestSessionQuestionSerializer(
                session_questions, many=True
            ).data

            return Response(
                {
                    "sessionId": test_session.id, 
                    "message": "Session started", 
                    "started_at": test_session.started_at,
                    "duration_minutes": test_session.test_assessment.duration_minutes,
                    "questions": data
                }
            )
        except TestAssessment.DoesNotExist:
            logger.error("TestAssessment does not exist")
            return Response(
                {"error": "There is no test available for this category"}, status=404
            )
        except TestBlueprint.DoesNotExist:
            logger.error("TestBlueprint does not exist")
            return Response(
                {
                    "error": "There is no test available for this category and difficulty"
                },
                status=404,
            )
