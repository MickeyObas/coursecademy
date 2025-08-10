from django.urls import include, path

urlpatterns = [
    path("auth/", include("users.auth_urls")),
    path("categories/", include("categories.urls")),
    path("courses/", include("courses.urls")),
    path("enrollments/", include("enrollments.urls")),
    path("lessons/", include("courses.lesson_urls")),
    path("questions/", include("assessments.question_urls")),
    path("assessments/", include("assessments.assessment_urls")),
    path("sessions/", include("assessments.session_urls")),
    path("users/", include("users.user_urls")),
]
