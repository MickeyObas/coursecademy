from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

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


class Question(TimeStampedModel):
    """
    A Question can belong to one of the following:

    1. A ModuleAssessment (via `module_assessment`)
    2. A CourseAssessment (via `course_assessment`)
    3. Neither - in which case it must have a `difficulty` set (i.e., it's a generic question)

    Rules:
    - A question can belong only to ONE of module_assessment or course_assessment (not both)
    - If it belongs to an assessment, it MUST have an `order`
    - If it does not belong to any assessment, it MUST have a `difficulty`
    """
    class QuestionTypes(models.TextChoices):
        MCQ = 'MCQ', 'Multiple Choice'
        TF = 'TF', 'True or False'
        FIB = 'FIB', 'Fill in the Blank'
    
    class Difficulties(models.TextChoices):
        EASY = "EASY", "Easy"
        NORMAL = "NORMAL", "Normal"
        HARD = "HARD", "Hard"

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    assessment_object = GenericForeignKey('content_type', 'object_id')
    order = models.PositiveSmallIntegerField(blank=True, null=True)
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    text = models.TextField()
    difficulty = models.CharField(max_length=6, choices=Difficulties.choices, blank=True, null=True)
    is_true = models.BooleanField(blank=True, null=True)
    correct_answer = models.CharField(max_length=100, blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    type = models.CharField(max_length=4, choices=QuestionTypes.choices)

    def clean(self) -> None:
        if (self.type == self.QuestionTypes.FIB) and not self.correct_answer:
            raise ValidationError("FIB questions must have 'correct_answer' set.")
        
        if (self.type != self.QuestionTypes.FIB) and self.correct_answer:
            raise ValidationError("Only FIB questions should have a direct 'correct_answer' value set.")
        
        if self.type != self.QuestionTypes.TF and self.is_true is not None:
            raise ValidationError("Only TF questions should have the 'is_true' flag set")
        
        if self.type == self.QuestionTypes.TF and self.is_true is None:
            raise ValidationError("TF questions should have the 'is_true' flag set")

        return super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.pk} - {self.text[:50]}"


class Option(TimeStampedModel):
    """
    An Option can only belong to Questions that are of the `MCQ` type

    - `TF` questions will be controlled with the 'is_true' field
    - `FIB` questions will be controlled with the `correct_answer` field
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text}"
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def clean(self):
        if self.question.type != Question.QuestionTypes.MCQ:
            raise ValidationError("Only MCQ questions should have option instances created for them.")

