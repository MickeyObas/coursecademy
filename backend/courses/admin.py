from django.contrib import admin

from .models import (Course, CourseLearningPoint, CourseProgress, CourseRating,
                     CourseSkill, Lesson, LessonProgress, Module,
                     ModuleProgress)


class ModuleModelAdmin(admin.ModelAdmin):
    ordering = ["order"]
    list_display = ["id", "__str__"]


class LessonModelAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "order"]

class LessonProgressModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'lesson__title', 'last_accessed_at']


admin.site.register(Lesson, LessonModelAdmin)
admin.site.register(Course)
admin.site.register(CourseRating)
admin.site.register(CourseSkill)
admin.site.register(CourseLearningPoint)
admin.site.register(Module, ModuleModelAdmin)
admin.site.register(LessonProgress, LessonProgressModelAdmin)
admin.site.register(ModuleProgress)
admin.site.register(CourseProgress)
