from django.contrib import admin

from .models import CourseAssessment, Question, Option, ModuleAssessment, TestAssessmentCategoryDescription, TestAssessment, TestBlueprint, TestSession, TestSessionAnswer, TestSessionQuestion


class TestBlueprintModelAdmin(admin.ModelAdmin):
    list_display = ['id', '__str__','rules']
    list_display_links = ['__str__']


class TestAssessmentModelAdmin(admin.ModelAdmin):
    list_display = ['id', '__str__']


admin.site.register(TestBlueprint, TestBlueprintModelAdmin)
admin.site.register(TestSession)
admin.site.register(TestSessionAnswer)
admin.site.register(TestSessionQuestion)
admin.site.register(ModuleAssessment)
admin.site.register(CourseAssessment)
admin.site.register(TestAssessment, TestAssessmentModelAdmin)
admin.site.register(TestAssessmentCategoryDescription)
admin.site.register(Question)
admin.site.register(Option)