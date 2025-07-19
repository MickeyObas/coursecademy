from django.urls import path, include


urlpatterns = [
    path('auth/', include('users.auth_urls')),
    path('categories/', include('categories.urls')),
    path('courses/', include('courses.urls')),
    path('enrollments/', include('enrollments.urls')),
    path('questions/', include('assessments.question_urls')),
    path('users/', include('users.user_urls')),
]