from django.contrib import admin

from .models import (Course, CourseLearningPoint, CourseRating, CourseSkill,
                     Module, Lesson, CourseProgress, LessonProgress, ModuleProgress)


class ModuleModelAdmin(admin.ModelAdmin):
    ordering = ["order"]


admin.site.register(Lesson)
admin.site.register(Course)
admin.site.register(CourseRating)
admin.site.register(CourseSkill)
admin.site.register(CourseLearningPoint)
admin.site.register(Module, ModuleModelAdmin)
admin.site.register(LessonProgress)
admin.site.register(ModuleProgress)
admin.site.register(CourseProgress)
