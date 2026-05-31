from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.users.models import UserRole


class IsAdmin(BasePermission):
    """Only admin users can access"""
    message = "Only administrators can access this resource."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsStore(BasePermission):
    """Only store owners can access"""
    message = "Only store owners can access this resource."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.STORE
        )


class IsClient(BasePermission):
    """Only clients can access"""
    message = "Only clients can access this resource."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.CLIENT
        )


class IsOwner(BasePermission):
    """Only object owner can access"""
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsSelfOrAdmin(BasePermission):
    """Allow users to access themselves and admins to access anyone."""
    message = "You do not have permission to access this user."

    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and (obj == request.user or request.user.role == UserRole.ADMIN)
        )


class IsOwnerOrReadOnly(BasePermission):
    """Allow owner to edit, everyone can read"""
    message = "You do not have permission to edit this resource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user


class IsStoreOwnerOrReadOnly(BasePermission):
    """Allow store owner to edit, everyone can read"""
    message = "You do not have permission to edit this resource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.owner == request.user


class IsAdminOrReadOnly(BasePermission):
    """Allow admin to edit, everyone can read"""

    def has_permission(self, request, view):
        return (
            request.method in SAFE_METHODS
            or (request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN)
        )
