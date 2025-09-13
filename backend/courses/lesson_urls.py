from django.urls import path

from . import views

urlpatterns = [
    path("create/", views.LessonCreateView.as_view()),
    path("<int:lesson_id>/questions/", views.LessonAssessmentQuestionsView.as_view()),
    path(
        "<int:lesson_id>/questions/update/", views.LessonAssessmentUpdateView.as_view()
    ),
    path("<int:lesson_id>/", views.LessonDetailView.as_view()),
    path("<int:lesson_id>/accessed/", views.LessonAccessedView.as_view()),
    path("<int:lesson_id>/complete/", views.LessonCompleteView.as_view()),
    path("<int:lesson_id>/progress/", views.LessonVideoProgress.as_view()),
    path("<int:lesson_id>/update/", views.LessonUpdateView.as_view()),
    path(
        "<int:lesson_id>/assessment/create/", views.LessonAssessmentCreateView.as_view()
    ),
    path("<int:lesson_id>/progress/update/", views.SaveLessonVideoProgress.as_view()),
]
