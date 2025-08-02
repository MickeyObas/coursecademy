from django.db import models

from api.models import TimeStampedModel


class ModuleAssessment(TimeStampedModel):
    module = models.OneToOneField("courses.Module", on_delete=models.CASCADE)

    def __str__(self):
        return f"Assessment: {self.module.course.title} - {self.module.order}"


class CourseAssessment(TimeStampedModel):
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class TestAssessment(TimeStampedModel):
    category = models.OneToOneField("categories.Category", on_delete=models.CASCADE)
    duration_minutes = models.PositiveIntegerField(default=15)
    description = models.TextField()

    def __str__(self):
        return f"{self.category}"