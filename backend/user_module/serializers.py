# backend/user_module/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from allauth.account.adapter import get_adapter
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.authtoken.models import Token as TokenModel

User = get_user_model()

class CustomRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'username': {'required': False},
            'email': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": ["Password fields didn't match."]
            })
        
        email = attrs.get('email')
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email": ["User with this email already exists."]
            })
        
        attrs.pop('password2', None)
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username', validated_data['email']),
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role= 'user'
        )
        return user

class CustomLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            return attrs
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio')
        read_only_fields = ('id', 'email')

class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'date_joined')
        read_only_fields = ('id', 'email', 'date_joined')

class CustomJWTSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_admin'] = user.is_admin()
        
        return token