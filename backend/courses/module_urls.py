from django.urls import path

from . import views

urlpatterns = [path("create/", views.ModuleCreateView.as_view())]
