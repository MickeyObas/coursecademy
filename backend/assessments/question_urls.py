from django.urls import path

from . import views


urlpatterns = [
    path('', views.QuestionListCreateView.as_view())
]