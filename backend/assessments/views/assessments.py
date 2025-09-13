import logging
import random

from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, permissions
from rest_framework.permissions import OR
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.models import (AssessmentSession, CourseAssessment,
                                LessonAssessment, TestAssessment,
                                TestBlueprint, TestSessionQuestion)
from assessments.serializers import (StartTestSessionSerializer,
                                     TestAssessmentSerializer,
                                     TestSessionQuestionSerializer)
from assessments.services import (start_course_assessment,
                                  start_lesson_assessment, start_test_session)
from core.permissions import IsAdminOrOwner, IsAdminOrReadOnly, IsStudent
from enrollments.permissions import IsEnrolled

logger = logging.getLogger(__name__)


class TestAssesmentList(generics.ListAPIView):
    serializer_class = TestAssessmentSerializer
    queryset = TestAssessment.objects.all()


class TestAssessmentDetail(generics.RetrieveAPIView):
    serializer_class = TestAssessmentSerializer
    queryset = TestAssessment.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "category_id"


class StartTestAssessmentSession(APIView):
    permission_classes = [IsStudent]

    def post(self, request, *args, **kwargs):

        serializer = StartTestSessionSerializer(
            data={
                "category": kwargs.get("category_id"),
                "difficulty": request.data.get("difficulty"),
            }
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        category = serializer.validated_data["category"]
        difficulty = serializer.validated_data["difficulty"]

        try:
            test_session = start_test_session(request.user, category, difficulty)
        except TestAssessment.DoesNotExist:
            return Response(
                {"error": "There is no test available for this category"}, status=404
            )
        except TestBlueprint.DoesNotExist:
            return Response(
                {
                    "error": "There is no test available for this category and difficulty"
                },
                status=404,
            )

        session_questions = TestSessionQuestion.objects.filter(
            test_session=test_session
        )
        data = TestSessionQuestionSerializer(session_questions, many=True).data

        return Response(
            {
                "sessionId": test_session.id,
                "message": "Session started",
                "started_at": test_session.started_at,
                "duration_minutes": test_session.test_assessment.duration_minutes,
                "questions": data,
            }
        )


class StartLessonAssessmentSession(APIView):
    permission_classes = [IsStudent, IsEnrolled]

    def post(self, request, *args, **kwargs):
        lesson_id = kwargs.get("lesson_id")
        if not lesson_id:
            return Response({"error": "lesson_id is required"}, status=400)

        user_lesson_assessment_session = start_lesson_assessment(
            request.user, lesson_id
        )

        return Response(
            {
                "assessment_session_id": user_lesson_assessment_session.id,
            }
        )


class StartCourseAssessmentSession(APIView):
    permission_classes = [IsStudent, IsEnrolled]

    def post(self, request, *args, **kwargs):
        course_slug = request.data.get("course_slug")
        if not course_slug:
            return Response({"error": "course_slug is requried"}, status=400)

        user_course_assessment_session, course_id = start_course_assessment(
            request.user, course_slug
        )

        return Response(
            {
                "assessment_session_id": user_course_assessment_session.id,
                "course_id": course_id,
            }
        )
