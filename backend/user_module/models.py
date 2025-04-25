# backend/user_module/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class CustomUser(AbstractUser):

    username = models.CharField(
        _('username'),
        max_length=40,
        unique=False,  
    )

    USER_ROLES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=10, choices=USER_ROLES, default='user')

    bio = models.TextField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    def is_admin(self):
        return self.role == 'admin'