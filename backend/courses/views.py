from django.utils.timezone import now
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from enrollments.models import Enrollment

from .models import (Course, CourseProgress, Lesson, LessonProgress, Module,
                     ModuleProgress)
from .serializers import (CourseSerializer, CourseUserSerializer,
                          LessonListSerializer, LessonSerializer,
                          ThinCourseSerializer, LessonUpdateSerializer, ModuleCreateSerializer, LessonCreateSerializer)
from .services import enroll_user_in_course
from assessments.models import Question, LessonAssessment, CourseAssessment
from assessments.serializers import QuestionSerializer
from assessments.services import update_lesson_assessment, update_course_assessment
from core.permissions import IsAdminOrInstructor, IsInstructor, IsCourseOwner, IsStudent
from courses.exceptions import NoLessonError, NoCourseError
from courses.services import update_lesson_access, update_lesson_completion
from enrollments.permissions import IsEnrolled


class CourseCreateView(APIView):
    permission_classes = [IsAdminOrInstructor]

    def post(self, request, *args, **kwargs):
        serializer = CourseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = ThinCourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "course_slug"


class ModuleCreateView(APIView):
    permission_classes = [IsAdminOrInstructor]

    def post(self, request, *args, **kwargs):
        serializer = ModuleCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Module has been created!'})
        return Response(serializer.errors, status=400)


class InstructorCourseListView(APIView):
    permission_classes = [IsInstructor]
    def get(self, request, *args, **kwargs):
        courses = Course.objects.filter(instructor=request.user)
        serializer = ThinCourseSerializer(courses, many=True)
        return Response(serializer.data)
    

class CourseLessonListView(APIView):
    def get(self, request, *args, **kwargs):
        course_id = kwargs.get('course_id')
        if not course_id:
            return Response({'error':  'course_id is required'}, status=400)
        
        lessons = Lesson.objects.filter(module__course_id=course_id).order_by('module__order', 'order')
        return Response(
            LessonListSerializer(
                lessons, 
                context={'request': request},
                many=True
                ).data
            )
    
class LessonAssessmentQuestionsView(APIView):
    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')
        if not lesson_id:
            return Response({'error': 'lesson_id is required.'}, status=400)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise NoLessonError()
        
        if hasattr(lesson, "lessonassessment"):
            questions = Question.objects.filter(
                content_type=ContentType.objects.get_for_model(LessonAssessment),
                object_id=lesson.lessonassessment.id
            )
            serializer = QuestionSerializer(questions, many=True)
            return Response(serializer.data)
        else:
            # No assessment and thus no questions
            return Response([])
        

class CourseAssessmentQuestionsView(APIView):
    def get(self, request, *args, **kwargs):
        course_id = kwargs.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required.'}, status=400)
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise NoCourseError()
        
        if hasattr(course, "courseassessment"):
            questions = Question.objects.filter(
                content_type=ContentType.objects.get_for_model(CourseAssessment),
                object_id=course.courseassessment.id
            )
            serializer = QuestionSerializer(questions, many=True)
            return Response(serializer.data)
        else:
            # No assessment and thus no questions
            return Response([])


class LessonAssessmentUpdateView(APIView):
    permission_classes = [IsAdminOrInstructor, IsCourseOwner]
    
    def post(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')
        if not lesson_id:
            return Response({'error': 'Lesson ID is required'}, status=400)
        
        questions = request.data.get('questions')
        if not isinstance(questions, list):
            return Response({"error": "Questions must be a list"}, status=400)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise NoLessonError()
        
        self.check_object_permissions(request, lesson)
        results = update_lesson_assessment(lesson, questions, request)
            
        return Response(results)


class CourseAssessmentUpdateView(APIView):
    permission_classes = [IsAdminOrInstructor, IsCourseOwner]

    def post(self, request, *args, **kwargs):
        course_id = kwargs.get('course_id')
        if not course_id:
            return Response({'error': 'Course ID is required'}, status=400)
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise NoCourseError()
        self.check_object_permissions(request, course)
        
        questions = request.data.get('questions')
        if not isinstance(questions, list):
            return Response({"error": "Questions must be a list"}, status=400)
            
        results = update_course_assessment(course, questions, request)

        return Response(results)


class LessonCreateView(APIView):
    permission_classes = [IsAdminOrInstructor]

    def post(self, request, *args, **kwargs):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise NoCourseError()
        
        if course.instructor != request.user:
            return Response({'error': "You do not own this course"}, status=403)

        serializer = LessonCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()

        return Response(
            LessonSerializer(lesson, context={"request": request}).data,
            status=201
        )
    

class LessonAssessmentCreateView(APIView):
    permission_classes = [IsAdminOrInstructor]
    def post(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')
        if not lesson_id:
            return Response({'error': "Lesson ID is required"}, status=400)

        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise NoLessonError()
        
        if lesson.module.course.instructor != request.user:
            return Response({"error": "You do not own this course"}, status=403)

        lesson_assessment, created = LessonAssessment.objects.get_or_create(lesson=lesson)

        return Response({'message': f'Lesson Assessment {"created" if created else "fetched"}'})


class LessonUpdateView(APIView):
    permission_classes = [IsAdminOrInstructor, IsCourseOwner]

    def patch(self, request, *args, **kwargs):
        lesson_id = kwargs.get("lesson_id")
        if not lesson_id:
            return Response({'error': "Lesson ID is required"}, status=400)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise NoLessonError()
        
        self.check_object_permissions(request, lesson)

        serializer = LessonUpdateSerializer(lesson, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()    

        return Response({'message': 'Lesson updated'}, status=200)
    

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
    permission_classes = [IsStudent]

    def post(self, request, pk):
        if not pk:
            return Response({'error': "Course pk is required"}, status=400)
        
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            raise NoCourseError()
        
        enroll_user_in_course(request.user, course)

        first_lesson = Lesson.objects.filter(module__course=course).order_by('module__order', 'order')
        if first_lesson.exists():
            first_lesson_id = first_lesson.first().id
        else:
            first_lesson_id = None

        return Response(
            {
                "message": "Enrolled successfully.",
                "first_lesson_id": first_lesson_id
                }, status=status.HTTP_201_CREATED
        )


class MyEnrolledProgresssSummary(APIView):
    permission_classes = [IsStudent]

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
            enrollment__user=user, completed_at__isnull=False, lesson_id__in=lesson_ids
        ).count()
        module_completed = ModuleProgress.objects.filter(
            enrollment__user=user, completed_at__isnull=False, module_id__in=module_ids
        ).count()
        course_completed = CourseProgress.objects.filter(
            enrollment__user=user, completed_at__isnull=False, enrollment__course_id__in=enrolled_course_ids
        ).count()

        return Response(
            {
                "lessons": {"total": lesson_total, "completed": lesson_completed},
                "modules": {"total": module_total, "completed": module_completed},
                "courses": {"total": course_total, "completed": course_completed},
            }
        )


class LastAccessedCourseView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        course_progress = CourseProgress.objects.filter(enrollment__user=user, last_accessed_at__isnull=False)
        if course_progress.exists():
            last_accessed_course = course_progress.latest('last_accessed_at').enrollment.course
            serializer = CourseUserSerializer(
                last_accessed_course, context={"request": request}
            )
            return Response(serializer.data)
        return Response({'status': 'empty', 'message': 'No course accessed'}, status=200)


class LessonAccessedView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, lesson_id):
        user = request.user

        if not lesson_id:
            return Response({'error': 'Lesson ID is required'}, status=400)

        try:
            lesson = Lesson.objects.select_related("module__course").get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise NoLessonError()

        update_lesson_access(request.user, lesson)

        return Response({"message": "Access time updated"})


class LessonDetailView(APIView):
    permission_classes = [IsAdminOrInstructor | IsEnrolled]

    def get(self, request, *args, **kwargs):
        if not kwargs.get("lesson_id"):
            return Response({"error": "Lesson ID is required"}, status=400)
        
        lesson = generics.get_object_or_404(Lesson, id=kwargs.get("lesson_id"))

        prev_modules = Module.objects.filter(
            course=lesson.module.course, order__lt=lesson.module.order
        )
        if prev_modules.exists():
            if LessonProgress.objects.filter(
                enrollment__user=request.user,
                lesson__module__in=prev_modules,
                completed_at__isnull=True,
            ).exists():
                return Response(
                    {"error": "You are not allowed to access this lesson yet"},
                    status=403,
                )

        return Response(LessonSerializer(lesson, context={"request": request}).data)
    

class LessonCompleteView(APIView):
    permission_classes = [IsStudent, IsEnrolled]

    def patch(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')

        if not lesson_id:
            return Response({"error": "Lesson ID required"}, status=400)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            raise NoLessonError()

        update_lesson_completion(request.user, lesson)
        
        return Response({'message': 'Lesson complete status updated'})
    

class LastAccessedLessonView(APIView):
    permission_classes = [IsStudent, IsEnrolled]

    def get(self, request, *args, **kwargs):
        if not kwargs.get("course_slug"):
            return Response({"error": "Course slug is requried"}, status=400)
        
        try:
            course = Course.objects.get(slug=kwargs.get('course_slug'))
        except Course.DoesNotExist:
            raise NoCourseError()
        
        course_progress = CourseProgress.objects.get(enrollment__course=course)
        if course_progress.last_accessed_lesson:
            return Response({'lessonId': course_progress.last_accessed_lesson.id})
        else:
            return Response({'error': 'No last accessed lesson'})


class LessonVideoProgress(APIView):
    permission_classes = [IsStudent, IsEnrolled]

    def get(self, request, *args, **kwargs):
        if not kwargs.get("lesson_id"):
            return Response({"error": "Lesson ID is required"}, status=400)
        
        try:
            lesson = Lesson.objects.get(id=kwargs.get('lesson_id'), type="VIDEO")
        except Lesson.DoesNotExist:
            raise NoLessonError()
        
        lesson_progress = LessonProgress.objects.get(
            enrollment__user=request.user,
            lesson=lesson
        )

        return Response({'progress': lesson_progress.progress})


class SaveLessonVideoProgress(APIView):
    permission_classes = [IsStudent, IsEnrolled]

    def post(self, request, *args, **kwargs):
        try:
            current_time = request.data.get('current_time')

            if not current_time:
                return Response({"error": "Current time is required"}, status=400)

            lesson = Lesson.objects.get(id=kwargs.get('lesson_id'))
            lesson_progress = LessonProgress.objects.get(
                enrollment__user=request.user,
                lesson=lesson
            ) 
            lesson_progress.progress = current_time
            lesson_progress.save()
            return Response({'message': 'Watch time updated'})
        except Lesson.DoesNotExist:
            raise NoLessonError()
        except LessonProgress.DoesNotExist:
            return Response({"error": "Lesson video progress does not exist"}, status=404)