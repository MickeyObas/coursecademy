from django.urls import path

from . import views

urlpatterns = [path("user/<int:pk>/", views.UserTestSessionList.as_view())]
