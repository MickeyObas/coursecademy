from django.contrib import admin

from .models import VerificationCode


class VerificationCodeModelAdmin(admin.ModelAdmin):
    list_display = ["email", "is_expired"]


admin.site.register(VerificationCode)
