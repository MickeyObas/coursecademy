from django.urls import path

from . import views

urlpatterns = [
    path("<int:category_id>/test/start/", views.StartTestAssessmentSession.as_view()),
    path("<int:session_id>/save-answer/", views.SaveTestAssesmentAnswer.as_view()),
    path("<int:session_id>/test/submit/", views.SubmitTestSession.as_view()),
]
