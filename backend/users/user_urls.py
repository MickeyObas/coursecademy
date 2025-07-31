from django.urls import path

from enrollments.views import UserEnrollmentList

from . import views

urlpatterns = [
    path("check/", views.get_profile),
    path("<int:user_id>/enrollments/", UserEnrollmentList.as_view()),
]
