from django.contrib import admin

from .models import Enrollment


class EnrollmentModelAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'progress', 'created_at']

admin.site.register(Enrollment)
