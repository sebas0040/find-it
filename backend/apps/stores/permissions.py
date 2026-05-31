from rest_framework.permissions import BasePermission
from apps.users.models import UserRole


class IsStoreUser(BasePermission):
    """Only authenticated users with STORE role can create stores."""
    message = "Only store users can create stores."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.STORE
        )


class IsStoreOwner(BasePermission):
    """Only store owner can edit"""
    message = "You do not have permission to edit this store."

    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsStoreOwnerOrAdmin(BasePermission):
    """Allow store owners or admins to edit a store."""
    message = "Only the store owner or an admin can edit this store."

    def has_object_permission(self, request, view, obj):
        return (
            request.user
            and request.user.is_authenticated
            and (obj.owner == request.user or request.user.role == UserRole.ADMIN)
        )
