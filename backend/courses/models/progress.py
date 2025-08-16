from django.contrib.auth import get_user_model
from django.db import models

from courses.models import Course, Lesson, Module

User = get_user_model()


class LessonProgress(models.Model):
    enrollment = models.ForeignKey('enrollments.Enrollment', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['enrollment', 'lesson']


    def __str__(self) -> str:
        return f"{self.enrollment.user.email} --> {self.lesson.title} === {'Completed' if self.completed_at else 'Not Completed'}"


class ModuleProgress(models.Model):
    enrollment = models.ForeignKey('enrollments.Enrollment', on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ['enrollment', 'module']


class CourseProgress(models.Model):
    enrollment = models.OneToOneField('enrollments.Enrollment', on_delete=models.CASCADE)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_lesson = models.ForeignKey('courses.Lesson', on_delete=models.SET_NULL, null=True, blank=True)
