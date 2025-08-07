from django.urls import path 

from . import views


urlpatterns = [
    path('<int:lesson_id>/accessed/', views.LessonAccessedView.as_view())
]