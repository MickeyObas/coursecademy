from django.urls import path

from . import views

urlpatterns = [
    path("<int:session_id>/<str:assessment_type>/", views.AssessmentSessionDetail.as_view()),
    path("user/<int:pk>/", views.UserTestSessionList.as_view()),

]
