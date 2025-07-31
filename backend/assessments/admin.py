from django.contrib import admin

from .models import (CourseAssessment, ModuleAssessment, Option, Question,
                     TestAssessment, TestAssessmentCategoryDescription,
                     TestBlueprint, TestSession, TestSessionAnswer,
                     TestSessionQuestion)


class TestBlueprintModelAdmin(admin.ModelAdmin):
    list_display = ["id", "__str__", "rules"]
    list_display_links = ["__str__"]


class TestAssessmentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "__str__"]
    list_display_links = ["__str__"]


class QuestionModelAdmin(admin.ModelAdmin):
    list_display = ["id", "__str__"]
    list_display_links = ["__str__"]


admin.site.register(TestBlueprint, TestBlueprintModelAdmin)
admin.site.register(TestSession)
admin.site.register(TestSessionAnswer)
admin.site.register(TestSessionQuestion)
admin.site.register(ModuleAssessment)
admin.site.register(CourseAssessment)
admin.site.register(TestAssessment, TestAssessmentModelAdmin)
admin.site.register(TestAssessmentCategoryDescription)
admin.site.register(Question, QuestionModelAdmin)
admin.site.register(Option)
