from django.urls import path

from enrollments.views import UserEnrollmentList

from . import views

urlpatterns = [path("me/", views.get_profile), path("me/update/", views.update_profile)]
