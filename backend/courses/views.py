from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollments.models import Enrollment

from .models import Course
from .serializers import CourseSerializer, ThinCourseSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = ThinCourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer


class CourseEnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        course = Course.objects.get(pk=pk)
        user = request.user

        if Enrollment.objects.filter(course=course, user=user).exists():
            return Response({"message": "Already enrolled."})

        Enrollment.objects.create(course=course, user=user)
        return Response(
            {"message": "Enrolled successfully."}, status=status.HTTP_201_CREATED
        )
