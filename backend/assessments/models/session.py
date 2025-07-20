from django.db import models
from django.contrib.auth import get_user_model

from api.models import TimeStampedModel


User = get_user_model()


class TestBlueprint(TimeStampedModel):
    test_assessment = models.ForeignKey('assessments.TestAssessment', on_delete=models.CASCADE)
    rules = models.JSONField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_active = True

    def __str__(self):
        return f"Blueprint for {self.test_assessment.category}/{self.test_assessment.difficulty}"


class TestSession(TimeStampedModel):
    class Status(models.TextChoices):
        IN_PROGRESS = 'IP', 'In Progress'
        SUBMITTED = 'S', 'Submitted'
        ERROR = 'ERR', 'Error'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    test_assessment = models.ForeignKey('assessments.TestAssessment', on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    total_score = models.FloatField(default=0.0)
    is_submitted = models.BooleanField(default=False)

    blueprint = models.ForeignKey(TestBlueprint, null=True, blank=True, on_delete=models.SET_NULL)
    duration_minutes = models.IntegerField(default=30)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices)

    def __str__(self):
        return f"{self.user} - TestSession #{self.pk}"
    

class TestSessionQuestion(TimeStampedModel):
    test_session = models.ForeignKey(TestSession, on_delete=models.CASCADE, related_name='questions')
    question = models.ForeignKey('assessments.Question', on_delete=models.PROTECT)
    order = models.PositiveIntegerField()
    snapshot_text = models.TextField()
    snapshot_options = models.JSONField()


class TestSessionAnswer(TimeStampedModel):
    session_question = models.ForeignKey(TestSessionQuestion, on_delete=models.CASCADE, related_name='answer')
    selected_option = models.CharField(max_length=100, blank=True, null=True)
    answered_at = models.DateTimeField(auto_now=True)
    is_correct = models.BooleanField(default=False)