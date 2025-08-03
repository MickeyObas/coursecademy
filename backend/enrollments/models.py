from django.contrib.auth import get_user_model
from django.db import models

from api.models import TimeStampedModel

User = get_user_model()


class Enrollment(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name='enrollments')
    progress = models.PositiveSmallIntegerField(default=0)

    class Meta:
        unique_together = ["user", "course"]

    def __str__(self):
        return (
            f"{self.user.email if self.user else 'Deleted User'} - {self.course.title}"
        )
