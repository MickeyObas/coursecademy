from django.contrib import admin

from .models import Course, CourseRating, CourseSkill, CourseLearningPoint


admin.site.register(Course)
admin.site.register(CourseRating)
admin.site.register(CourseSkill)
admin.site.register(CourseLearningPoint)