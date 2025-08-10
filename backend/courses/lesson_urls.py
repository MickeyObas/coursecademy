from django.urls import path

from . import views

urlpatterns = [
    path("<int:pk>/", views.LessonDetailView.as_view()),
    path("<int:lesson_id>/accessed/", views.LessonAccessedView.as_view()),
    path("<int:lesson_id>/complete/", views.LessonCompleteView.as_view()),
]
