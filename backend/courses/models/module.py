from django.db import models


class Module(models.Model):
    order = models.PositiveSmallIntegerField()
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=150)
    description = models.TextField()

    class Meta:
        unique_together = ['order', 'course']

    def __str__(self):
        return f"{self.course.title}: Module - {self.order}"