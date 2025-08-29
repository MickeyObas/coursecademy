from django.urls import path

from . import views

urlpatterns = [
    path("<int:session_id>/save-answer/", views.SaveTestAssesmentSessionAnswer.as_view()),
    path("lesson/<int:session_id>/save-answer/", views.SaveAssessmentSessionAnswer.as_view()),
    path("user/<int:pk>/", views.UserTestSessionList.as_view()),
    path("<int:session_id>/<str:assessment_type>/", views.AssessmentSessionDetail.as_view()),

]
