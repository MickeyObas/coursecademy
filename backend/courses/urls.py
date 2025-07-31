from django.urls import path

from . import views

urlpatterns = [
    path("", views.CourseListCreateView.as_view()),
    path("<int:pk>/", views.CourseDetailView.as_view()),
    path("<int:pk>/enroll/", views.CourseEnrollView.as_view()),
]
