from django.urls import path

from . import views

urlpatterns = [
    path("<int:pk>/", views.LessonAssessmentSessionDetail.as_view()),
    path("user/<int:pk>/", views.UserTestSessionList.as_view()),

]
