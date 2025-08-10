from datetime import datetime

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (Question, TestSession, TestSessionAnswer,
                      TestSessionQuestion)
from ..serializers import (SaveAssessmentAnswerSerializer,
                           SaveTestAssessmentAnswerSerializer,
                           TestSessionSerializer)
from ..services import (mark_assessment_session, mark_test_session,
                        save_assessment_answer, save_test_answer)


class UserTestSessionList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        test_sessions = TestSession.objects.filter(user=user).order_by("-created_at")
        serializer = TestSessionSerializer(test_sessions, many=True)
        return Response(serializer.data)


class SaveTestAssesmentAnswer(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = SaveTestAssessmentAnswerSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        question_id = data.get("question_id")
        test_session_id = data.get("test_session_id")
        answer = data.get("answer")

        result = save_test_answer(request.user, question_id, test_session_id, answer)

        if result.get("error"):
            return Response({"error": result["error"]}, status=400)
        return Response({"message": result["message"]})


class SaveAssessmentAnswer(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = SaveAssessmentAnswerSerializer(data=data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        question_id = data.get("question_id")
        answer = data.get("answer")
        # session_id = data.get('session_id')
        # assessment_type = data.get('assessment_type')

        result = save_assessment_answer(request.user, question_id, answer)

        return Response({"yay": "yayyy"})


class SubmitTestSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data

        test_session_id = data.get("test_session_id")
        if not test_session_id:
            return Response({"error": "test_session_id is required"}, status=400)

        result = mark_test_session(request.user, test_session_id)

        if result.get("error"):
            return Response({"error": result["error"]}, status=400)

        return Response({"message": result["message"]})


class SubmitAssessmentSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        print(kwargs)

        session_id = kwargs.get("session_id")
        assessment_id = kwargs.get("assessment_id")
        assessment_type = kwargs.get("assessment_type")

        if not session_id:
            return Response({"error": "session_id is required"}, status=400)

        result = mark_assessment_session(
            request.user, session_id, assessment_id, assessment_type
        )

        if result.get("error"):
            return Response({"error": result["error"]}, status=400)

        return Response({"message": result["message"]})
