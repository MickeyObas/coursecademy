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


class CourseCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = CourseSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course, context={'request': request}).data, status=201)
        return Response(serializer.errors, status=400)


class CourseListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = ThinCourseSerializer


class CourseDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "course_slug"


class ModuleCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ModuleCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Module has been created!'})
        return Response(serializer.errors, status=400)

class InstructorCourseListView(APIView):
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
        
        lesson = Lesson.objects.get(id=lesson_id)
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
        
        course = Course.objects.get(id=course_id)
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
    def post(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')
        if not lesson_id:
            return Response({'error': 'Lesson ID is required'}, status=400)
        
        lesson = Lesson.objects.get(id=lesson_id)
        questions = request.data.get('questions')
        print(len(questions))

        results = []

        # Handle the actual saving/updating of each question
        for q_item in questions:
            question_id = q_item.get("id")
            if question_id:
                print(q_item)
                try:
                    question = Question.objects.get(id=question_id)
                    serializer = QuestionSerializer(question, data=q_item, partial=True, context={'request': request})
                except Question.DoesNotExist:
                    return Response({'error': f"Question with ID {question_id} does not exist"})
            else:
                q_item["assessment_type_input"] = request.data.get("assessment_type_input")
                q_item["lesson_id"] = lesson_id
                serializer = QuestionSerializer(data=q_item, context={'request': request})
        
            if serializer.is_valid(raise_exception=True):
                instance = serializer.save()
                results.append(QuestionSerializer(instance).data)
            else:
                return Response(serializer.errors, status=400)
            
        return Response(results)


class CourseAssessmentUpdateView(APIView):
    def post(self, request, *args, **kwargs):
        course_id = kwargs.get('course_id')
        if not course_id:
            return Response({'error': 'Course ID is required'}, status=400)
        
        course = Course.objects.get(id=course_id)
        questions = request.data.get('questions')
        print(len(questions))

        results = []

        # Handle the actual saving/updating of each question
        for q_item in questions:
            question_id = q_item.get("id")
            if question_id:
                print(q_item)
                try:
                    question = Question.objects.get(id=question_id)
                    serializer = QuestionSerializer(question, data=q_item, partial=True, context={'request': request})
                except Question.DoesNotExist:
                    return Response({'error': f"Question with ID {question_id} does not exist"})
            else:
                q_item["assessment_type_input"] = request.data.get("assessment_type_input")
                q_item["lesson_id"] = course_id
                serializer = QuestionSerializer(data=q_item, context={'request': request})
        
            if serializer.is_valid(raise_exception=True):
                instance = serializer.save()
                results.append(QuestionSerializer(instance).data)
            else:
                return Response(serializer.errors, status=400)
            
        return Response(results)


class LessonCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LessonCreateSerializer(data=request.data)
        if serializer.is_valid():
            lesson = serializer.save()
            return Response(
                LessonSerializer(lesson, context={"request": request}).data,
                status=201
            )
        return Response(serializer.errors, status=400)
    

class LessonAssessmentCreateView(APIView):
    def post(self, request, *args, **kwargs):
        lesson_id = kwargs.get('lesson_id')
        lesson = Lesson.objects.get(id=lesson_id)
        lesson_assessment, created = LessonAssessment.objects.get_or_create(lesson=lesson)
        return Response({'message': f'Lesson Assessment {"created" if created else "fetched"}'})


class LessonUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        lesson_id = kwargs.get("lesson_id")
        if not lesson_id:
            return Response({'error': "Lesson ID is required"}, status=400)
        del kwargs['lesson_id']
        print(kwargs)
        
        lesson = Lesson.objects.get(id=lesson_id)

        serializer = LessonUpdateSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()    
            return Response({'message': 'Lesson updated'}, status=200)
    
        return Response(serializer.errors, status=400)


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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        course_progress = CourseProgress.objects.filter(enrollment__user=user)
        if course_progress.exists():
            last_accessed_course = course_progress.latest('last_accessed_at').enrollment.course
            serializer = CourseUserSerializer(
                last_accessed_course, context={"request": request}
            )
            return Response(serializer.data)
        return Response({'status': 'empty', 'message': 'No course accessed'}, status=200)


class LessonAccessedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        user = request.user

        try:
            lesson = Lesson.objects.select_related("module__course").get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found"}, status=400)

        lesson_progress = LessonProgress.objects.get(enrollment__user=user, lesson=lesson)
        lesson_progress.last_accessed_at = now()
        lesson_progress.save()

        module = lesson.module
        module_progress, _ = ModuleProgress.objects.get_or_create(
            enrollment__user=user, module=module
        )
        module_progress.last_accessed_at = now()
        module_progress.save()

        course = module.course
        course_progress, _ = CourseProgress.objects.get_or_create(
            enrollment__user=user, enrollment__course=course
        )
        course_progress.last_accessed_at = now()
        course_progress.last_accessed_lesson = lesson
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
    def patch(self, request, *args, **kwargs):
        user = request.user
        lesson_id = kwargs.get('lesson_id')
        lesson = Lesson.objects.get(id=lesson_id)

        with transaction.atomic():
            user_lesson_progress= LessonProgress.objects.get(
                enrollment__user=user,
                lesson=lesson
            )
            user_lesson_progress.completed_at = now()
            user_lesson_progress.save()

            module = lesson.module
            all_completed = all(
                LessonProgress.objects.filter(enrollment__user=user, lesson=l, completed_at__isnull=False).exists()
                for l in module.lessons.all())
            if all_completed:
                module_progress = ModuleProgress.objects.get(enrollment__user=user, module=module)
                module_progress.completed_at = now()
                module_progress.save()
        
        return Response({'message': 'Lesson complete status updated'})
    

class LastAccessedLessonView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        course = Course.objects.get(slug=kwargs.get('course_slug'))
        course_progress = CourseProgress.objects.get(enrollment__course=course)
        if course_progress.last_accessed_lesson:
            return Response({'lessonId': course_progress.last_accessed_lesson.id})
        else:
            return Response({'error': 'No last accessed course'})


class LessonVideoProgress(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        lesson = Lesson.objects.get(id=kwargs.get('lesson_id'))
        lesson_progress = LessonProgress.objects.get(
            enrollment__user=request.user,
            lesson=lesson
        )
        return Response({'progress': lesson_progress.progress})


class SaveLessonVideoProgress(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):  
        print("DATA", request.data)
        current_time = request.data.get('current_time')
        lesson = Lesson.objects.get(id=kwargs.get('lesson_id'))
        lesson_progress = LessonProgress.objects.get(
            enrollment__user=request.user,
            lesson=lesson
        ) 
        lesson_progress.progress = current_time
        lesson_progress.save()
        return Response({'message': 'Watch time updated'})