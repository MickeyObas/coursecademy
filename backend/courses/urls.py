from django.urls import path

from . import views

urlpatterns = [
    path("", views.CourseListCreateView.as_view()),
    path("<slug:course_slug>/", views.CourseDetailView.as_view()),
    path("other-courses/", views.OtherCoursesView.as_view()),
    path("<int:pk>/enroll/", views.CourseEnrollView.as_view()),
    path("progress/summary/", views.MyEnrolledProgresssSummary.as_view())
]
