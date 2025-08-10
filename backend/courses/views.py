from django.utils.timezone import now
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollments.models import Enrollment

from .models import (Course, CourseProgress, Lesson, LessonProgress, Module,
                     ModuleProgress)
from .serializers import (CourseSerializer, CourseUserSerializer,
                          LessonListSerializer, LessonSerializer,
                          ThinCourseSerializer)
from .services import enroll_user_in_course


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = ThinCourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "course_slug"


class OtherCoursesView(APIView):
    def get(self, request):
        user = request.user
        enrolled_ids = Course.objects.filter(enrollments__user=user).values_list(
            "id", flat=True
        )
        other_courses_qs = Course.objects.exclude(id__in=enrolled_ids)
        serializer = CourseSerializer(
            other_courses_qs, many=True, context={"request": request}
        )
        return Response(serializer.data)


class CourseEnrollView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        course = Course.objects.get(pk=pk)
        user = request.user

        if Enrollment.objects.filter(course=course, user=user).exists():
            return Response({"message": "Already enrolled."})

        enroll_user_in_course(user, course)

        return Response(
            {"message": "Enrolled successfully."}, status=status.HTTP_201_CREATED
        )


class MyEnrolledProgresssSummary(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        enrolled_course_ids = Enrollment.objects.filter(user=user).values_list(
            "course_id", flat=True
        )
        module_ids = Module.objects.filter(
            course_id__in=enrolled_course_ids
        ).values_list("id", flat=True)
        lesson_ids = Lesson.objects.filter(module_id__in=module_ids).values_list(
            "id", flat=True
        )

        lesson_total = len(lesson_ids)
        module_total = len(module_ids)
        course_total = len(enrolled_course_ids)

        lesson_completed = LessonProgress.objects.filter(
            user=user, completed_at__isnull=False, lesson_id__in=lesson_ids
        ).count()
        module_completed = ModuleProgress.objects.filter(
            user=user, completed_at__isnull=False, module_id__in=module_ids
        ).count()
        course_completed = CourseProgress.objects.filter(
            user=user, completed_at__isnull=False, course_id__in=enrolled_course_ids
        ).count()

        return Response(
            {
                "lessons": {"total": lesson_total, "completed": lesson_completed},
                "modules": {"total": module_total, "completed": module_completed},
                "courses": {"total": course_total, "completed": course_completed},
            }
        )


class LastAccessedCourseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        course_progress = CourseProgress.objects.filter(user=user)
        if course_progress.exists():
            last_accessed_course = course_progress.latest('last_accessed_at').course
            serializer = CourseUserSerializer(
                last_accessed_course, context={"request": request}
            )
            return Response(serializer.data)
        return Response({'message': 'No course accessed'}, status=404)


class LessonAccessedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user

        try:
            lesson = Lesson.objects.select_related("module__course").get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=400)

        lesson_progress = LessonProgress.objects.get(user=user, lesson=lesson)
        lesson_progress.last_accessed_at = now()
        lesson_progress.save()

        module = lesson.module
        module_progress, _ = ModuleProgress.objects.get_or_create(
            user=user, module=module
        )
        module_progress.last_accessed_at = now()
        module_progress.save()

        course = module.course
        course_progress, _ = CourseProgress.objects.get_or_create(
            user=user, course=course
        )
        course_progress.last_accessed_at = now()
        course_progress.save()

        return Response({"message": "Access time updated"})


class LessonDetailView(APIView):
    def get(self, request, *args, **kwargs):
        lesson = generics.get_object_or_404(Lesson, id=kwargs.get("pk"))

        prev_modules = Module.objects.filter(
            course=lesson.module.course, order__lt=lesson.module.order
        )
        if prev_modules.exists():
            if LessonProgress.objects.filter(
                user=request.user,
                lesson__module__in=prev_modules,
                completed_at__isnull=True,
            ).exists():
                return Response(
                    {"error": "You are not allowed to access this lesson yet"},
                    status=403,
                )

        return Response(LessonSerializer(lesson, context={"request": request}).data)
    

class LessonCompleteView(APIView):
    def patch(self, request, *args, **kwargs):
        user = request.user
        lesson_id = kwargs.get('lesson_id')
        lesson = Lesson.objects.get(id=lesson_id)
        user_lesson_progress= LessonProgress.objects.get(
            user=user,
            lesson=lesson
        )
        user_lesson_progress.completed_at = now()
        user_lesson_progress.save()
        
        return Response({'message': 'Lesson complete status updated'})
