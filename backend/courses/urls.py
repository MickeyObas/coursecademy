from django.urls import path

from . import views

urlpatterns = [
    path("", views.CourseListView.as_view()),
    # TODO: Rename URLs after configuring user type (INSTRUCTOR)
    path("instructed/", views.CourseListView.as_view()),
    path("create/", views.CourseCreateView.as_view()),
    path("last-accessed/", views.LastAccessedCourseView.as_view()),
    path("other-courses/", views.OtherCoursesView.as_view()),
    path("progress/summary/", views.MyEnrolledProgresssSummary.as_view()),
    path("<slug:course_slug>/", views.CourseDetailView.as_view()),
    path("<int:pk>/enroll/", views.CourseEnrollView.as_view()),
    path("<int:course_id>/lessons/", views.CourseLessonListView.as_view()),
    path("<slug:course_slug>/last-accessed-lesson/", views.LastAccessedLessonView.as_view()),
]
