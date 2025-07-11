from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views


urlpatterns =  [
    path("register/", views.register),
    path("verify-email/", views.verify_email),
    path("send-confirmation-code/", views.send_confirmation_code_to_email),
    path("resend-confirmation-code/", views.resend_confirmation_code_to_email),
    path("token/", views.login),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]