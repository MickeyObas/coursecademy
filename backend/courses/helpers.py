from django.shortcuts import get_object_or_404

from assessments.models import CourseAssessment, LessonAssessment

from .models import Course, Lesson, Module


def get_course_from_object(obj):
    if isinstance(obj, Course):
        return obj
    elif isinstance(obj, Module):
        return obj.module
    elif isinstance(obj, Lesson):
        return obj.module.course
    elif isinstance(obj, LessonAssessment):
        return obj.lesson.module.course
    elif isinstance(obj, CourseAssessment):
        return obj.course
    raise ValueError(f"Unsupported object type {type(obj)}")


def resolve_course_from_kwargs(kwargs):
    """
    Given kwargs that may contain course_id, module_id, lesson_id, or assessment_id,
    resolve and return the related Course.
    """
    if "course_id" in kwargs:
        return get_object_or_404(Course, id=kwargs["course_id"])

    if "course_slug" in kwargs:
        return get_object_or_404(Course, slug=kwargs["course_slug"])

    if "module_id" in kwargs:
        module = get_object_or_404(Module, id=kwargs["module_id"])
        return module.course

    if "lesson_id" in kwargs:
        lesson = get_object_or_404(Lesson, id=kwargs["lesson_id"])
        return lesson.module.course

    if "assessment_id" in kwargs:
        assessment = get_object_or_404(LessonAssessment, pk=kwargs["assessment_id"])
        return assessment.lesson.module.course

    return None
