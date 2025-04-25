# backend/user_module/urls.py
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserProfileAPIView, UserListAPIView, UserDetailAPIView, AdminRegisterAPIView,
    GoogleLogin, RegisterAPIView, LoginAPIView
)

urlpatterns = [

    path('auth/register/', RegisterAPIView.as_view(), name='register'),
    path('auth/admin/register/', AdminRegisterAPIView.as_view(), name='admin-register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    

    path('auth/google/', GoogleLogin.as_view(), name='google_login'),

    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
    path('users/', UserListAPIView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
]