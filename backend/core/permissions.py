from rest_framework.permissions import BasePermission

from courses.helpers import resolve_course_from_kwargs, get_course_from_object

SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account_type == "S"
    

class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.account_type == "I"
    

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff
    

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user == obj.user
    

class IsCourseOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        course = get_course_from_object(obj)
        return request.user == course.instructor
    

class IsAdminOrOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or request.user == obj.user
    
class IsAdminOrInstructor(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff or request.user.account_type == 'I'


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and (
                request.user.is_staff or
                request.user.account_type == "A"
            )
        )
    
class IsAdminInstructorOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.method in SAFE_METHODS or
            request.user and (
                request.user.is_staff or
                request.user.account_type == "I"
            )
        )