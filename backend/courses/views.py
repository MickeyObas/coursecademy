from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollments.models import Enrollment

from .models import Course, Module, Lesson, CourseProgress, ModuleProgress, LessonProgress
from .serializers import CourseSerializer, ThinCourseSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = ThinCourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'course_slug'


class OtherCoursesView(APIView):
    def get(self, request):
        user = request.user
        enrolled_courses_qs = Course.objects.filter(enrollments__user=user)
        other_courses_qs = Course.objects.exclude(id__in=[enrolled_courses_qs.values_list('id', flat=True)])
        serializer = CourseSerializer(other_courses_qs, many=True)
        return Response(serializer.data)


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


class MyEnrolledProgresssSummary(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        enrolled_course_ids = Enrollment.objects.filter(user=user).values_list('course_id', flat=True)
        module_ids = Module.objects.filter(course_id__in=enrolled_course_ids).values_list('id', flat=True)
        lesson_ids = Lesson.objects.filter(module_id__in=module_ids).values_list('id', flat=True)

        lesson_total = len(lesson_ids)
        module_total = len(module_ids)
        course_total = len(enrolled_course_ids)


        lesson_completed = LessonProgress.objects.filter(
            user=user,
            completed_at__isnull=False,
            lesson_id__in=lesson_ids
        ).count()
        module_completed = ModuleProgress.objects.filter(
            user=user,
            completed_at__isnull=False,
            module_id__in=module_ids
        ).count()
        course_completed = CourseProgress.objects.filter(
            user=user,
            completed_at__isnull=False,
            course_id__in=enrolled_course_ids
        ).count()
        
        return Response({
            "lessons": {"total": lesson_total, "completed": lesson_completed},
            "modules": {"total": module_total, "completed": module_completed},
            "courses": {"total": course_total, "completed": course_completed},
        })