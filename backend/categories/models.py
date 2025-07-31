from django.db import models

from api.models import TimeStampedModel


class Category(TimeStampedModel):
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
