# backend/user_module/management/commands/create_initial_admin.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates the initial admin user from environment variables'

    def handle(self, *args, **options):
        admin_email = os.environ.get('INITIAL_ADMIN_EMAIL')
        admin_password = os.environ.get('INITIAL_ADMIN_PASSWORD')
        admin_username = os.environ.get('INITIAL_ADMIN_USERNAME', admin_email)
        admin_first_name = os.environ.get('INITIAL_ADMIN_FIRST_NAME', 'Admin')
        admin_last_name = os.environ.get('INITIAL_ADMIN_LAST_NAME', 'User')
        
        if not admin_email or not admin_password:
            self.stdout.write(self.style.ERROR(
                'Environment variables INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set'))
            return
            
        if User.objects.filter(email=admin_email).exists():
            self.stdout.write(self.style.WARNING(
                f'Admin user with email {admin_email} already exists'))
            user = User.objects.get(email=admin_email)
            if user.role != 'admin':
                user.role = 'admin'
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(
                    f'Updated user {admin_email} to admin role'))
            return
            
        # Create the initial admin user
        user = User.objects.create_user(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            first_name=admin_first_name,
            last_name=admin_last_name,
        )
        user.role = 'admin'
        user.is_staff = True
        user.is_superuser = True
        user.save()
            
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created/updated initial admin user with email: {admin_email}'))
        self.stdout.write(self.style.SUCCESS(
            f'ACCESS TOKEN: {access_token}'))
        self.stdout.write(self.style.SUCCESS(
            f'REFRESH TOKEN: {str(refresh)}'))
        
        # You might want to save these tokens to a file for your testing scripts
        with open('admin_tokens.txt', 'w') as f:
            f.write(f'ACCESS_TOKEN={access_token}\n')
            f.write(f'REFRESH_TOKEN={str(refresh)}\n')