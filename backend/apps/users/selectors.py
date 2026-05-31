from django.db.models import QuerySet
from apps.users.models import User


def get_user_by_id(user_id: str) -> User | None:
    """Get user by ID"""
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


def get_user_by_email(email: str) -> User | None:
    """Get user by email"""
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None


def search_users(query: str = "", role: str = None) -> QuerySet:
    """Search users by name, email, or phone"""
    qs = User.objects.all()
    
    if query:
        qs = qs.filter(
            name__icontains=query
        ) | qs.filter(
            email__icontains=query
        ) | qs.filter(
            phone__icontains=query
        )
    
    if role:
        qs = qs.filter(role=role)
    
    return qs.order_by("-created_at")


def get_user_by_role(role: str) -> QuerySet:
    """Get all users with a specific role"""
    return User.objects.filter(role=role).order_by("-created_at")