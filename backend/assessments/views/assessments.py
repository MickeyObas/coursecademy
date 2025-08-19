import logging
import random

from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.models import (AssessmentSession, LessonAssessment, Question,
                                TestAssessment, TestBlueprint, TestSession,
                                TestSessionQuestion, CourseAssessment)
from assessments.serializers import (AssessmentQuestionSerializer,
                                     QuestionDisplaySerializer,
                                     QuestionSerializer,
                                     StartTestSessionSerializer,
                                     TestAssessmentSerializer,
                                     TestSessionQuestionSerializer)
from assessments.services import start_test_session

logger = logging.getLogger(__name__)


class TestAssessmentDetail(generics.RetrieveAPIView):
    serializer_class = TestAssessmentSerializer
    queryset = TestAssessment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "category_id"


class StartTestAssessmentSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):

        data = {
            "category": kwargs.get("category_id"),
            "difficulty": request.data.get("difficulty"),
        }
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


class StartLessonAssessmentSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        lesson_assessment = LessonAssessment.objects.get(
            lesson_id=kwargs.get("lesson_id")
        )
        # Start new lessons attempt/session
        content_type = ContentType.objects.get_for_model(LessonAssessment)
        user_lesson_session, created = AssessmentSession.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            object_id=lesson_assessment.id,
        )

        return Response(
            {
                "assessmentSessionId": user_lesson_session.id, # Perhaps return just this ID?
            }
        )


class StartCourseAssessmentSession(APIView):
    def post(self, request, *args, **kwargs):
        course_slug = request.data.get('course_slug')
        course_assessment = CourseAssessment.objects.get(
            course__slug=course_slug
        )
        content_type = ContentType.objects.get_for_model(CourseAssessment)
        user_course_session, created = AssessmentSession.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            object_id=course_assessment.id
        )

        return Response(
            {
                "assessmentSessionId": user_course_session.id,
                "courseId": course_assessment.course.id
            }
        )
