from django.db import models

from api.models import TimeStampedModel


class ModuleAssessment(TimeStampedModel):
    module = models.OneToOneField('courses.Module', on_delete=models.CASCADE)

    def __str__(self):
        return f"Assessment: {self.module.course.title} - {self.module.order}"


class CourseAssessment(TimeStampedModel):
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.course.title} - {self.title}"
    

class TestAssessment(TimeStampedModel):
    class Difficulties(models.TextChoices):
        EASY = "EASY", "Easy"
        NORMAL = "NORMAL", "Normal"
        HARD = "HARD", "Hard"
        
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    difficulty = models.CharField(max_length=10, choices=Difficulties.choices)

    class Meta:
        unique_together = ['category', 'difficulty']

    def __str__(self):
        return f"{self.category} - {self.difficulty}"
    

class TestAssessmentCategoryDescription(models.Model):
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    text = models.TextField()

    def __str__(self):
        return f"Description for TestAssessment: {self.category.title}"