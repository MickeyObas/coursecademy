from django.db import models


class Module(models.Model):
    order = models.DecimalField(max_digits=3, decimal_places=1)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    title = models.CharField(max_length=150)
    description = models.TextField()

    def __str__(self):
        return f"{self.course.title}: Module - {self.order}"