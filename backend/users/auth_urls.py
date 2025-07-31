from django.urls import path

from . import views

urlpatterns = [
    path("check/", views.get_profile),
    path("register/", views.register),
    path("verify-email/", views.verify_email),
    path("send-confirmation-code/", views.send_confirmation_code_to_email),
    path("resend-confirmation-code/", views.resend_confirmation_code_to_email),
    path("token/", views.login),
    path(
        "token/refresh/", views.CookieTokenRefreshView.as_view(), name="token_refresh"
    ),
]
