from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from courses.serializers import CourseUserSerializer, ThinCourseSerializer

from .models import Enrollment
from courses.models import CourseProgress
from .serializers import EnrollmentSerializer
from core.permissions import IsStudent, IsCourseOwner, IsOwner

import logging
logger = logging.getLogger(__name__)


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
        logger.info(request.query_params)
        filter = request.query_params.get("filter", "active")
        enrolled_qs = Course.objects.filter(enrollments__user=request.user)

        if filter == "completed":
            completed_course_ids = CourseProgress.objects.filter(
                enrollment__user=request.user,
                completed_at__isnull=False
            ).values_list('enrollment__course_id')
            enrolled_qs = enrolled_qs.filter(id__in=completed_course_ids)

        serializer = CourseUserSerializer(
            enrolled_qs, many=True, context={"request": request}
        )
        data = sorted(serializer.data, key=lambda enrollment: enrollment["progress"]["percentage"], reverse=True)

        return Response(data)
