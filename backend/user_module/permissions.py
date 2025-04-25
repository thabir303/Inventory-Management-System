# backend/user_module/permissions.py
from rest_framework import permissions

class IsUserOrAdmin(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):

        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        return request.user.is_authenticated and (obj == request.user or request.user.is_admin())

class IsAdminUser(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_admin()