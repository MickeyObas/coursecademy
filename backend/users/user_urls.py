from django.urls import path

from . import views
from enrollments.views import UserEnrollmentList


urlpatterns =  [
    path("check/", views.get_profile),
    path('<int:user_id>/enrollments/', UserEnrollmentList.as_view())
]