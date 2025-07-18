from django.db import models
from django.core.exceptions import ValidationError
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

    module_assessment = models.ForeignKey(
        'assessments.ModuleAssessment',
        on_delete=models.CASCADE, 
        blank=True, 
        null=True
    )
    course_assessment = models.ForeignKey(
        'assessments.CourseAssessment',
        on_delete=models.CASCADE,
        blank=True,
        null=True
    )
    order = models.PositiveSmallIntegerField(blank=True, null=True)
    category = models.ForeignKey('categories.Category', on_delete=models.CASCADE)
    text = models.TextField()
    difficulty = models.CharField(max_length=6, choices=Difficulties.choices, blank=True, null=True)
    correct_answer = models.CharField(max_length=30, blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    type = models.CharField(max_length=4, default=QuestionTypes.MCQ)
    is_true = models.BooleanField(default=False)

    class Meta:
        unique_together = [
            ('order', 'module_assessment'),
            ('order', 'course_assessment')
        ]
    
    def clean(self) -> None:
        if self.module_assessment and self.course_assessment:
            raise ValidationError("A question can only belong to at most a module assessment or a course assessment.")
        
        if not (self.module_assessment or self.course_assessment) and not self.difficulty:
            raise ValidationError("Any question without relation to an assessment must have its difficulty set.")
        
        if (self.module_assessment or self.course_assessment) and not self.order:
            raise ValidationError("Questions for module and course assessments must have an order.")
        
        if (self.type == self.QuestionTypes.FIB) and not self.correct_answer:
            raise ValidationError("FIB questions must have 'correct_answer' set.")
        
        if (self.type != self.QuestionTypes.FIB) and self.correct_answer:
            raise ValidationError("Only FIB questions should have a direct 'correct_answer' value set.")
        
        if (self.type != self.QuestionTypes.TF) and not not self.is_true:
            raise ValidationError("Only TF questions should have the 'is_true' flag set")

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
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text}"
    
    def clean(self):
        if self.question.type == Question.QuestionTypes.TF:
            raise ValidationError("TF questions should not have option instances created for them.")

