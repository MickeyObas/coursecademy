from django.contrib import admin

from .models import (CourseAssessment, ModuleAssessment, Option, Question,
                     TestAssessment,
                     TestBlueprint, TestSession, TestSessionAnswer,
                     TestSessionQuestion)


class TestBlueprintModelAdmin(admin.ModelAdmin):
    list_display = ["id", "__str__", "rules"]
    list_display_links = ["__str__"]


class TestAssessmentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "__str__", "duration_minutes"]
    list_display_links = ["__str__"]


class QuestionModelAdmin(admin.ModelAdmin):
    list_display = ["id", "__str__"]
    list_display_links = ["__str__"]


class TestSessionModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'test_assessment', 'status', 'started_at', 'submitted_at', 'marked_at', 'score', 'is_expired']


class TestSessionQuestionModelAdmin(admin.ModelAdmin):
    list_display = ['test_session', 'question']


class TestSessionAnswerModelAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'session_question__question', 'input', 'option_id', 'is_correct', 'answered_at']



admin.site.register(TestBlueprint, TestBlueprintModelAdmin)
admin.site.register(TestSession, TestSessionModelAdmin)
admin.site.register(TestSessionAnswer, TestSessionAnswerModelAdmin)
admin.site.register(TestSessionQuestion, TestSessionQuestionModelAdmin)
admin.site.register(ModuleAssessment)
admin.site.register(CourseAssessment)
admin.site.register(TestAssessment, TestAssessmentModelAdmin)
admin.site.register(Question, QuestionModelAdmin)
admin.site.register(Option)
