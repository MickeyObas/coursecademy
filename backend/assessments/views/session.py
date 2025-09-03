from datetime import datetime

from django.contrib.contenttypes.models import ContentType

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (Question, TestSession, TestSessionAnswer,
                      TestSessionQuestion, LessonAssessment, AssessmentSession, CourseAssessment)
from ..serializers import (SaveAssessmentAnswerSerializer,
                           SaveTestAssessmentAnswerSerializer, TestSessionSerializer)
from ..services import (mark_assessment_session, mark_test_session,
                        save_assessment_answer, save_test_answer)
from assessments.serializers import QuestionDisplaySerializer, SubmitAssessmentSessionSerializer, TestSessionQuestionSerializer
from core.permissions import IsStudent
from courses.helpers import get_course_from_object


class TestSessionDetail(APIView):
    def get(self, request, **kwargs):
        test_session_id = kwargs.get('test_session_id')
        if not test_session_id:
            return Response({"error": "Test session ID is required"}, status=400)
        
        try:
            test_session = TestSession.objects.get(id=test_session_id)
        except TestSession.DoesNotExist:
            return Response({"error": "Invalid test session ID"}, status=400)

        if test_session.user != request.user:
            return Response({"error": "You are not authorized to perform this action"}, status=403)
        
        test_session_questions = TestSessionQuestion.objects.filter(
            test_session=test_session
        )
        test_question_data = TestSessionQuestionSerializer(test_session_questions, many=True).data

        data = {
            "started_at": test_session.started_at,
            "duration_minutes": test_session.test_assessment.duration_minutes,
            "questions": test_question_data
        }

        return Response(data)
        # Response(
        # {
        #     "sessionId": test_session.id,
        #     "message": "Session started",
        #     "started_at": test_session.started_at,
        #     "duration_minutes": test_session.test_assessment.duration_minutes,
        #     "questions": data,
        # }


class UserTestSessionList(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user
        test_sessions = TestSession.objects.filter(user=user).order_by("-created_at")
        serializer = TestSessionSerializer(test_sessions, many=True)
        return Response(serializer.data)


class SaveTestAssesmentSessionAnswer(APIView):
    permission_classes = [IsStudent]

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = SaveTestAssessmentAnswerSerializer(data=data)

        serializer.is_valid(raise_exception=True)

        result = save_test_answer(
            request.user, 
            data.get("question_id"), 
            data.get("test_session_id"), 
            data.get("answer")
        )

        return Response({"message": result["message"]})


class SaveAssessmentSessionAnswer(APIView):
    permission_classes = [IsStudent]

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = SaveAssessmentAnswerSerializer(data=data)

        serializer.is_valid(raise_exception=True)

        result = save_assessment_answer(
            request.user, 
            data.get("question_id"), 
            data.get("answer")
        )

        return Response({"message": "Answer saved"})


class SubmitTestSession(APIView):
    permission_classes = [IsStudent]

    def post(self, request, *args, **kwargs):
        test_session_id = request.data.get("test_session_id")

        if not test_session_id:
            return Response({"error": "test_session_id is required"}, status=400)

        result = mark_test_session(request.user, test_session_id)

        return Response({"message": "Test submitted successfully"})


class SubmitAssessmentSession(APIView):
    permission_classes = [IsStudent]

    def post(self, request, *args, **kwargs):
        serializer = SubmitAssessmentSessionSerializer(data={**kwargs})
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        result = mark_assessment_session(
            request.user, 
            validated["session_id"], 
            validated["assessment_id"], 
            validated["assessment_type"]
        )

        if result.get("error"):
            return Response({"error": result["error"]}, status=400)

        return Response({"message": result["message"], "score": result["score"], "lessonId": result['lessonId'], "isCourseAssessment": result['isCourseAssessment']})


class AssessmentSessionDetail(APIView):
    permissions = [IsStudent]

    def get(self, request, *args, **kwargs):
        assessment_type = kwargs.get('assessment_type').lower()
        session_id = kwargs.get('session_id')

        if assessment_type not in ["lesson", "course"]:
            return Response({'error': "Invalid request. Improper assessment type."}, status=400)
        
        if assessment_type == "lesson":
            content_type = ContentType.objects.get_for_model(LessonAssessment)
        else:
            content_type = ContentType.objects.get_for_model(CourseAssessment)

        session = AssessmentSession.objects.get(
            id=session_id,
            user=request.user,
            content_type=content_type
        )
        if session:
            questions = Question.objects.filter(
                content_type=content_type,
                object_id=session.assessment_object.id
            )
            return Response({
                'courseSlug': get_course_from_object(session.assessment_object).slug,
                'sessionId': session.id,
                'assessmentId': session.assessment_object.id,
                'questions': QuestionDisplaySerializer(questions, many=True).data
            })

        return Response({'error': 'No session found'}, status=404)