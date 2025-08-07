from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Enrollment
from courses.models import Course
from courses.serializers import ThinCourseSerializer, CourseUserSerializer
from .serializers import EnrollmentSerializer


class EnrollmentListCreate(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserEnrollmentList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrolled_qs = Course.objects.filter(enrollments__user=request.user)
        serializer = CourseUserSerializer(enrolled_qs, many=True, context={'request': request})

        return Response(serializer.data)
