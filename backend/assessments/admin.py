from django.contrib import admin

from .models import CourseAssessment, Question, Option, ModuleAssessment

admin.site.register(ModuleAssessment)
admin.site.register(CourseAssessment)
admin.site.register(Question)
admin.site.register(Option)