from django.urls import path

from . import views

urlpatterns = [
    path("", views.EnrollmentListCreate.as_view()),
    path("my/", views.UserEnrollmentList.as_view()),
    path("<int:pk>/", views.EnrollmentDetailView.as_view()),
]
