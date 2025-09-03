from django.db import transaction
from django.utils.timezone import now

from .models import Lesson, LessonProgress, Module, ModuleProgress, CourseProgress
from enrollments.models import Enrollment
from enrollments.exceptions import AlreadyEnrolledError
from courses.models import LessonProgress, ModuleProgress, CourseProgress


@transaction.atomic
def enroll_user_in_course(user, course):
    if Enrollment.objects.filter(course=course, user=user).exists():
        raise AlreadyEnrolledError()
    
    # Check if the user has paid for the course - if it's not free, that is
    
    enrollment = Enrollment.objects.create(course=course, user=user)
    lessons = Lesson.objects.filter(module__course=course)
    LessonProgress.objects.bulk_create([
        LessonProgress(enrollment=enrollment, lesson=lesson)
        for lesson in lessons
    ])

    modules = Module.objects.filter(course=course)
    ModuleProgress.objects.bulk_create([
        ModuleProgress(enrollment=enrollment, module=module)
        for module in modules
    ])

    CourseProgress.objects.create(enrollment=enrollment)

@transaction.atomic
def update_lesson_access(user, lesson):
    lesson_progress, created = LessonProgress.objects.get_or_create(enrollment__user=user, lesson=lesson)
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


@transaction.atomic
def update_lesson_completion(user, lesson):
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