from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import Throttled

from assessments.exceptions import NoCourseAssessmentError, NoLessonAssessmentError, NoTestAssessmentError, NoTestBlueprintError, NoQuestionError, TestSessionExpiredError, NoAssessmentSessionError, NoTestSessionError
from enrollments.exceptions import AlreadyEnrolledError
from courses.exceptions import LessonLockedError


def custom_exception_handler(exc, context):
    if isinstance(exc, NoTestAssessmentError):
        return Response(
            {"error": "There is no test available for this category"},
            status=404
        )
    
    if isinstance(exc, NoLessonAssessmentError):
        return Response(
            {"error": "There is no assessment avaialable for this lesson"},
            status=404
        )
    
    if isinstance(exc, NoCourseAssessmentError):
        return Response(
            {"error": "There is no assessment avaialable for this course"},
            status=404
        )
    
    if isinstance(exc, NoTestBlueprintError):
        return Response(
            {"error": "There is no test available for this category and difficulty "},
            status=404

        )
    if isinstance(exc, NoQuestionError):
        return Response(
            {"error": "There is no question with this ID"},
            status=404
        )
    
    if isinstance(exc, TestSessionExpiredError):
        return Response(
            {"error": "The test session has expired"},
            status=400
        )
    
    if isinstance(exc, NoAssessmentSessionError):
        return Response(
            {"error": "There is no such assessment session"},
            status=404
        )

    if isinstance(exc, NoTestSessionError):
        return Response(
            {"error": "There is no such test session"},
            status=404
        )
    
    if isinstance(exc, AlreadyEnrolledError):
        return Response(
            {"error": "User already enrolled in this course"},
            status=400
        )
    
    if isinstance(exc, Throttled):
        return Response(
            {
                'error': 'You have made too many requests. Please try again later.',
                'retry_after': exc.wait
            },
            status=429,
            headers={"Retry-After": exc.wait}
        )
    
    if isinstance(exc, LessonLockedError):
        return Response(
            {'error': 'You cannot perform this action.'},
            status=403
        )
    
    return exception_handler(exc, context)
    
    
