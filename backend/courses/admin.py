from django.contrib import admin

from .models import Course, CourseRating, CourseSkill, CourseLearningPoint, Module


class ModuleModelAdmin(admin.ModelAdmin):
    ordering = ['order']

admin.site.register(Course)
admin.site.register(CourseRating)
admin.site.register(CourseSkill)
admin.site.register(CourseLearningPoint)
admin.site.register(Module, ModuleModelAdmin)