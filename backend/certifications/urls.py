from django.urls import path

from . import views

urlpatterns = [path("", views.CertificationListView.as_view())]
