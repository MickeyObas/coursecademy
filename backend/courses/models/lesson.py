from django.db import models


class Lesson(models.Model):
    class LessonTypes(models.TextChoices):
        ARTICLE = "ARTICLE", "Article"
        VIDEO = "VIDEO", "Video"

    type = models.CharField(max_length=10, choices=LessonTypes.choices)
    content = models.TextField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(blank=True, null=True)
    module = models.ForeignKey(
        "courses.Module", on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to="lessons/videos/", blank=True, null=True)

    class Meta:
        unique_together = ["order", "module"]
        ordering = ["module__order", "order"]

    def __str__(self):
        return f"{self.module.order}.{self.order} - {self.title}"
    
    def save(self, *args, **kwargs):
        if self.order is None:
            last_order = (
                Lesson.objects.filter(module=self.module)
                .aggregate(models.Max("order"))
                .get("order__max")
            )
            self.order = (last_order or 0) + 1
        super().save(*args, **kwargs)
