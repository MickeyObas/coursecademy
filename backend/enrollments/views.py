from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from courses.serializers import CourseUserSerializer, ThinCourseSerializer

from .models import Enrollment
from .serializers import EnrollmentSerializer
from core.permissions import IsStudent, IsCourseOwner, IsOwner


class EnrollmentListCreate(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [IsStudent]


class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsStudent, IsOwner]
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer


class UserEnrollmentList(APIView):

    def get(self, request):
        enrolled_qs = Course.objects.filter(enrollments__user=request.user)
        serializer = CourseUserSerializer(
            enrolled_qs, many=True, context={"request": request}
        )

        return Response(serializer.data)
