from django.urls import path

from . import views

urlpatterns = [
    path("", views.QuestionListCreateView.as_view()),
    path("<int:question_id>/options/", views.OptionCreateView.as_view()),
]
