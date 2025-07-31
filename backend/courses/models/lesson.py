from django.db import models


class Lesson(models.Model):
    order = models.PositiveSmallIntegerField(default=1)
    module = models.ForeignKey("courses.Module", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    class Meta:
        unique_together = ["order", "module"]
        ordering = ["order"]

    def __str__(self):
        return f"{self.module.order}.{self.order} - {self.title}"


class LessonArticle(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)


class LessonVideo(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
