from datetime import datetime

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Question, TestSession, TestSessionQuestion, TestSessionAnswer
from ..serializers import SaveTestAssessmentAnswerSerializer
from ..services import mark_test_session


class SaveTestAssesmentAnswer(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = SaveTestAssessmentAnswerSerializer(data=data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        question_id = data.get('question_id')
        test_session_id = data.get('test_session_id')
        answer = data.get('answer')

        question = Question.objects.get(id=question_id)
        test_session = TestSession.objects.get(id=test_session_id, user=request.user)
        session_question = TestSessionQuestion.objects.get(
            test_session=test_session,
            question=question
        )

        tsa, created = TestSessionAnswer.objects.get_or_create(
            session_question=session_question
        )
        tsa.input=answer if session_question.question.type != 'MCQ' else None
        tsa.option_id = answer if session_question.question.type == 'MCQ' else None
        tsa.save()

        return Response({'message': 'Answer saved successfully'}, status=201)


class SubmitTestSession(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        data = request.data
        
        test_session_id = data.get('test_session_id')
        if not test_session_id:
            return Response({'error': 'test_session_id is required'}, status=400)

        mark_test_session(request.user, test_session_id)

        return Response({'message': 'Test submitted successfully'}, status=200)