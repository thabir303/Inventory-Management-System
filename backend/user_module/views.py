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

User = get_user_model()

class RegisterAPIView(APIView):

    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CustomRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserDetailSerializer(user).data
            }
            
            return Response(token_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminRegisterAPIView(APIView):

    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):

        if not request.user.is_superuser:
            return Response(
                {"detail": "Only superusers can create admin accounts."}, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = CustomRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            user.role = 'admin'
            user.save()
            
            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserDetailSerializer(user).data
            }
            
            return Response(token_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CustomLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        
        if user:
   
            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserDetailSerializer(user).data
            }
            
            return Response(token_data)
        
        return Response(
            {"detail": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class UserProfileAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserDetailSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailAPIView(APIView):
    permission_classes = [IsUserOrAdmin]

    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)
    
    def get(self, request, pk):
        user = self.get_object(pk)
        self.check_object_permissions(request, user)
        serializer = UserDetailSerializer(user)
        return Response(serializer.data)
    
    def put(self, request, pk):
        user = self.get_object(pk)
        self.check_object_permissions(request, user)
        serializer = UserDetailSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):

        user = self.get_object(pk)
        self.check_object_permissions(request, user)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'http://localhost:3000/auth/google/callback/'  
    client_class = OAuth2Client