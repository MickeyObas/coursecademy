from rest_framework import serializers

from .models import Enrollment
from users.serializers import UserSerializer
from courses.serializers import ThinCourseSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    course = ThinCourseSerializer()
    class Meta:
        model = Enrollment
        fields = [
            'user',
            'course',
            'progress',
            'created_at'
        ]