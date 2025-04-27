# backend/user_module/views.py
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from .serializers import (
    UserSerializer, UserDetailSerializer, 
    CustomLoginSerializer, CustomRegistrationSerializer
)
from .permissions import IsUserOrAdmin, IsAdminUser
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

User = get_user_model()

class RegisterAPIView(APIView):

    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CustomRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            token_data = {
                'success': True,
                'message': 'Registration successful',
                'data': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserDetailSerializer(user).data
                }
            }
            
            return Response(token_data, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
class AdminRegisterAPIView(APIView):

    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):

        if not request.user.is_admin():
            return Response({
                    'success': False,
                    "detail": "Only administrators can create admin accounts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = CustomRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            user.role = 'admin'
            user.is_staff = True 
            user.save()
            
            refresh = RefreshToken.for_user(user)
            token_data = {
                'success': True,
                'message': 'Admin registration successful',
                'data': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserDetailSerializer(user).data
                }
            }
            
            return Response(token_data, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Admin registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CustomLoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Login validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)     
           
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
        if user:
   
            refresh = RefreshToken.for_user(user)
            token_data = {
                'success': True,
                'message': 'Login successful',
                'data': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserDetailSerializer(user).data
                }
            }
            
            return Response(token_data)
        
        return Response({
            'success': False,
            'message': 'Invalid credentials',
            'errors': {'credentials': ['Email or password is incorrect']}
        }, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response({
            'success': True,
            'message': 'User profile retrieved successfully',
            'data': serializer.data
        })
    
    def put(self, request):
        serializer = UserDetailSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Profile update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
class UserListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response({
            'success': True,
            'message': 'Users retrieved successfully',
            'data': serializer.data,
            'count': len(serializer.data)
        })


class UserDetailAPIView(APIView):
    permission_classes = [IsUserOrAdmin]

    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)
    
    def get(self, request, pk):
        user = self.get_object(pk)
        self.check_object_permissions(request, user)
        serializer = UserDetailSerializer(user)
        return Response({
            'success': True,
            'message': 'User details retrieved successfully',
            'data': serializer.data
        })
    
    def put(self, request, pk):
        user = self.get_object(pk)
        self.check_object_permissions(request, user)
        serializer = UserDetailSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'User updated successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'User update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):

        user = self.get_object(pk)
        self.check_object_permissions(request, user)
        user.delete()
        return Response({
            'success': True,
            'message': 'User deleted successfully'
        }, status=status.HTTP_200_OK)
    
class CustomTokenRefreshView(BaseTokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            response.data = {
                'success': True,
                'message': 'Token refreshed successfully',
                'data': response.data
            }
        else:
            response.data = {
                'success': False,
                'message': 'Failed to refresh token',
                'errors': response.data
            }
        
        return response
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:5173/auth/google/callback/'  
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code in [200, 201]:
            response.data = {
                'success': True,
                'message': 'Google login successful',
                'data': response.data
            }
        else:
            response.data = {
                'success': False,
                'message': 'Google login failed',
                'errors': response.data
            }
        
        return response