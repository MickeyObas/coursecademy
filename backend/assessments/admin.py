from django.contrib import admin

from .models import CourseAssessment, TestAssessment, Question, Option

admin.site.register(CourseAssessment)
admin.site.register(TestAssessment)
admin.site.register(Question)
admin.site.register(Option)