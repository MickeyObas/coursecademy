from django.db import transaction

from .models import Lesson, LessonProgress, Module, ModuleProgress, CourseProgress
from enrollments.models import Enrollment


@transaction.atomic
def enroll_user_in_course(user, course):
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