from django.db import models
from django.core.exceptions import ValidationError

from api.models import TimeStampedModel


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
    difficulty = models.CharField(max_length=6, choices=Difficulties.choices, default=Difficulties.EASY)


class Question(models.Model):
    class QuestionTypes(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice'
        TF = 'TF', 'True or False'
        FIB = 'FIB', 'Fill in the Blank'
    
    class Difficulties(models.TextChoices):
        EASY = "EASY", "Easy"
        NORMAL = "NORMAL", "Normal"
        HARD = "HARD", "Hard"

    assessment = models.ForeignKey('CourseAssessment', on_delete=models.CASCADE, null=True, blank=True)
    test = models.ForeignKey('TestAssessment', on_delete=models.CASCADE, null=True, blank=True)
    text = models.TextField()
    difficulty = models.CharField(max_length=6, choices=Difficulties.choices, blank=True, null=True)
    correct_answer = models.CharField(max_length=30, blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.assessment.course.title if self.assessment else self.test.category.title if self.test else 'Question Item'} - {self.text[:50]}"
    
    def clean(self):
        if bool(self.assessment) == bool(self.test):
            raise ValidationError("Question must belong to either a CourseAssessment or a TestAssessment.")
        
        # Enforce difficulty level for ONLY test questions
        if self.test and not self.difficulty:
            raise ValidationError("Difficulty level is required for test questions.")
        
        if self.assessment and self.difficulty:
            raise ValidationError("Difficulty should not be set for course assessment questions.")
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)



