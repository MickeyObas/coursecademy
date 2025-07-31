from django.urls import path

from . import views

urlpatterns = [
    path("<int:category_id>/test/start/", views.StartTestAssessmentSession.as_view())
]
