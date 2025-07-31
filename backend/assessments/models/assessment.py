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

    def __str__(self):
        return f"{self.category}"


class TestAssessmentCategoryDescription(models.Model):
    category = models.ForeignKey("categories.Category", on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return f"Description for TestAssessment: {self.category.title}"
