from django.db import models

from api.models import TimeStampedModel


class Certification(TimeStampedModel):
    enrollment = models.OneToOneField(
        "enrollments.Enrollment", on_delete=models.CASCADE
    )
    issued_at = models.DateTimeField(blank=True, null=True)
    certificate_file = models.FileField(
        upload_to="certificates/", blank=True, null=True
    )

    def __str__(self):
        return f"Certificate for {self.enrollment.user} - {self.enrollment.course}"
