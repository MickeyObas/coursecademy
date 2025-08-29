from rest_framework.permissions import BasePermission

from courses.helpers import get_course_from_object, resolve_course_from_kwargs
from enrollments.models import Enrollment


class IsEnrolled(BasePermission):
    def has_permission(self, request, view):
        course = resolve_course_from_kwargs(view.kwargs)
        if not course:
            return False
        return Enrollment.objects.filter(
            user=request.user,
            course=course
        ).exists()
        