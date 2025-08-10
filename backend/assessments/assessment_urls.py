from django.urls import path

from . import views

urlpatterns = [
    path("<int:category_id>/test/start/", views.StartTestAssessmentSession.as_view()),
    path(
        "lessons/<int:lesson_id>/start/", views.StartLessonAssessmentSession.as_view()
    ),
    path("<int:session_id>/save-answer/", views.SaveTestAssesmentAnswer.as_view()),
    path("lesson/<int:session_id>/save-answer/", views.SaveAssessmentAnswer.as_view()),
    path("<int:session_id>/test/submit/", views.SubmitTestSession.as_view()),
    path(
        "<str:assessment_type>/<int:assessment_id>/submit/<int:session_id>/",
        views.SubmitAssessmentSession.as_view(),
    ),
    path("<int:category_id>/test/", views.TestAssessmentDetail.as_view()),
]
