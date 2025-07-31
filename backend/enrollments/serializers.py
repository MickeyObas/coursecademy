from rest_framework import serializers

from courses.serializers import ThinCourseSerializer
from users.serializers import UserSerializer

from .models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    course = ThinCourseSerializer()

    class Meta:
        model = Enrollment
        fields = ["user", "course", "progress", "created_at"]
