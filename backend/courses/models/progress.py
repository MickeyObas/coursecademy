from django.contrib.auth import get_user_model
from django.db import models

from courses.models import Course, Lesson, Module

User = get_user_model()


class LessonProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ["user", "lesson"]

    def __str__(self) -> str:
        return f"{self.user.email} --> {self.lesson.title} === {'Completed' if self.completed_at else 'Not Completed'}"


class ModuleProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ["user", "module"]


class CourseProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ["user", "course"]
