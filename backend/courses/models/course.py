from django.contrib.auth import get_user_model
from django.db import models
from django.utils.text import slugify

from api.models import TimeStampedModel

User = get_user_model()


class Course(TimeStampedModel):
    title = models.CharField(max_length=300)
    category = models.ForeignKey("categories.Category", on_delete=models.CASCADE)
    slug = models.SlugField(blank=True, unique=True)
    description = models.TextField()
    instructor = models.ForeignKey(
        User, null=True, on_delete=models.SET_NULL, related_name="courses"
    )
    thumbnail = models.ImageField(upload_to="course_thumbnails/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    tags = models.CharField(
        max_length=255, blank=True, help_text="Comma-separated values"
    )
    rating_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    enrollment_count = models.PositiveBigIntegerField(default=0)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["slug"])]

    def __str__(self):
        return self.title[:50]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def update_rating(self):
        pass

    @property
    def lesson_count(self):
        from ..models import Lesson
        return Lesson.objects.filter(module__course=self).count()
    
    @property
    def module_count(self):
        return self.modules.count()


class CourseSkill(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.course.title} - {self.name}"


class CourseLearningPoint(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="learning_points"
    )
    text = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.course.title} - {self.text[:100]}"


class CourseRating(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField(
        choices=[(i, f"{i} Star") for i in range(1, 6)]
    )
    review = models.TextField(blank=True)

    class Meta:
        unique_together = ["user", "course"]
