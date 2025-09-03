from django.urls import path

from . import views

urlpatterns = [
    path("tests/<int:test_session_id>/", views.TestSessionDetail.as_view()),
    path("<int:session_id>/save-answer/", views.SaveTestAssesmentSessionAnswer.as_view()),
    path("lesson/<int:session_id>/save-answer/", views.SaveAssessmentSessionAnswer.as_view()),
    path("tests/my/", views.UserTestSessionList.as_view()),
    path("<int:session_id>/<str:assessment_type>/", views.AssessmentSessionDetail.as_view()),
]
