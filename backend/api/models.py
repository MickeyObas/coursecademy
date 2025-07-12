from django.db import models
from django.utils import timezone

import uuid


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class VerificationCode(TimeStampedModel):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    email = models.EmailField()
    code = models.CharField(max_length=6)
    expiry_time = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        unique_together = ["email", "code"]

    def save(self, *args, **kwargs):
        if not self.expiry_time:
            self.expiry_time = timezone.now() + timezone.timedelta(minutes=3)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expiry_time
