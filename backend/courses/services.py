import logging

from django.db import transaction
from django.utils.timezone import now

from assessments.models import LessonAssessment
from assessments.services import start_lesson_assessment
from certifications.services import issue_certificate
from courses.exceptions import LessonLockedError
from courses.models import CourseProgress, LessonProgress, ModuleProgress
from enrollments.exceptions import AlreadyEnrolledError
from enrollments.models import Enrollment

from .models import (CourseProgress, Lesson, LessonProgress, Module,
                     ModuleProgress)

logger = logging.getLogger(__name__)


@transaction.atomic
def enroll_user_in_course(user, course):
    if Enrollment.objects.filter(course=course, user=user).exists():
        raise AlreadyEnrolledError()

    # Check if the user has paid for the course - if it's not free, that is

    enrollment = Enrollment.objects.create(course=course, user=user)
    lessons = Lesson.objects.filter(module__course=course)
    LessonProgress.objects.bulk_create(
        [LessonProgress(enrollment=enrollment, lesson=lesson) for lesson in lessons]
    )

    modules = Module.objects.filter(course=course)
    ModuleProgress.objects.bulk_create(
        [ModuleProgress(enrollment=enrollment, module=module) for module in modules]
    )

    CourseProgress.objects.create(enrollment=enrollment)


@transaction.atomic
def update_lesson_access(user, lesson):
    if not is_lesson_unlocked(user, lesson):
        raise LessonLockedError()

    lesson_progress, created = LessonProgress.objects.get_or_create(
        enrollment__user=user, lesson=lesson
    )
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
    user_lesson_progress = LessonProgress.objects.get(
        enrollment__user=user, lesson=lesson
    )
    user_lesson_progress.completed_at = now()
    user_lesson_progress.save()

    module = lesson.module
    all_lessons_completed = all(
        LessonProgress.objects.filter(
            enrollment__user=user, lesson=l, completed_at__isnull=False
        ).exists()
        for l in module.lessons.all()
    )
    if all_lessons_completed:
        module_progress = ModuleProgress.objects.get(
            enrollment__user=user, module=module
        )
        module_progress.completed_at = now()
        module_progress.save()

    course = lesson.module.course
    all_modules_completed = all(
        ModuleProgress.objects.filter(
            enrollment__user=user, module=m, completed_at__isnull=False
        ).exists()
        for m in Module.objects.filter(course=course)
    )
    if all_modules_completed:
        course_progress = CourseProgress.objects.get(
            enrollment__user=user, enrollment__course=course
        )
        course_progress.completed_at = now()
        course_progress.save()
        issue_certificate(user, course)


def get_next_step(user, course, current_lesson_id=None, current_assessment_id=None):
    lessons = list(
        Lesson.objects.filter(
            module__course=course,
        ).order_by("module__order", "order")
    )
    assessments = list(
        LessonAssessment.objects.filter(lesson__module__course=course).order_by(
            "lesson__module__order", "lesson__order"
        )
    )

    sequence = []

    for lesson in lessons:
        sequence.append(("lesson", lesson))
        for a in assessments:
            if a.lesson.id == lesson.id:
                sequence.append(("assessment", a))

    current_index = None
    current_obj = None
    for i, (type_, obj) in enumerate(sequence):
        if (type_ == "lesson" and int(current_lesson_id or 0) == obj.id) or (
            type_ == "assessment" and int(current_assessment_id or 0) == obj.id
        ):
            current_index = i
            current_obj = obj
            break

    if current_index is None:
        return {"type": "error", "message": "Invalid current step"}

    if current_index + 1 < len(sequence):
        next_type, next_obj = sequence[current_index + 1]
        if next_type == "lesson":
            # Update lesson_completion if not completed already
            lesson_progress = LessonProgress.objects.get(
                enrollment__user=user,
                lesson_id=int(
                    current_obj.id
                    if isinstance(current_obj, Lesson)
                    else current_obj.lesson.id
                ),
            )
            if not lesson_progress.completed_at:
                update_lesson_completion(user, lesson_progress.lesson)
            return {
                "type": next_type,
                "id": next_obj.id,
                "title": str(next_obj),
                "url": f"/courses/{course.slug}/lessons/{next_obj.id}/",
                "is_unlocked": is_lesson_unlocked(user, next_obj),
            }

        elif next_type == "assessment":
            lesson_assessment_session = start_lesson_assessment(
                user, next_obj.lesson.id
            )
            return {
                "type": next_type,
                "id": next_obj.id,
                "title": str(next_obj),
                "url": f"/take-assessment/lesson/{next_obj.lesson.id}/sessions/{lesson_assessment_session.id}/",
                "is_unlocked": is_assessment_unlocked(user, next_obj),
            }
    else:
        return {"type": "end", "message": "Course Completed"}


def is_lesson_unlocked(user, lesson):
    if not user.is_authenticated:
        return False

    prev_lessons = Lesson.objects.filter(
        module=lesson.module,
        order__lt=lesson.order,
    )

    if prev_lessons.exists():
        if LessonProgress.objects.filter(
            enrollment__user=user, lesson__in=prev_lessons, completed_at__isnull=True
        ).exists():
            return False

    prev_modules = Module.objects.filter(
        course=lesson.module.course, order__lt=lesson.module.order
    )
    if prev_modules.exists():
        if LessonProgress.objects.filter(
            enrollment__user=user,
            lesson__module__in=prev_modules,
            completed_at__isnull=True,
        ).exists():
            return False

    return True


def is_assessment_unlocked(user, assessment):  # Only lesson for now
    return is_lesson_unlocked(user, assessment.lesson)
