from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from api.models import TimeStampedModel

from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    class AccountTypes(models.TextChoices):
        ADMIN = 'A', 'Admin'
        STUDENT = 'S', 'Student'
        INSTRUCTOR = 'I', 'Instructor'

    account_type = models.CharField(max_length=500, default=AccountTypes.STUDENT, choices=AccountTypes.choices)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(_("email address"), unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    is_first_login = models.BooleanField(default=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email


class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures', null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.email}'s Profile"
