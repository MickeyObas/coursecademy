from django.db import models


class Lesson(models.Model):
    class LessonTypes(models.TextChoices):
        ARTICLE = "ARTICLE", "Article"
        VIDEO = "VIDEO", "Video"

    type = models.CharField(max_length=10, choices=LessonTypes.choices)
    content = models.TextField(blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=1)
    module = models.ForeignKey(
        "courses.Module", on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to="lessons/videos/", blank=True, null=True)

    class Meta:
        unique_together = ["order", "module"]
        ordering = ["order"]

    def __str__(self):
        return f"{self.module.order}.{self.order} - {self.title}"


class LessonArticle(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)


class LessonVideo(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
