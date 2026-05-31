from django.contrib.auth.hashers import make_password
from apps.users.models import User, UserRole
from apps.users.exceptions import ValidationError, DuplicateError


def create_user(
    email: str,
    name: str,
    password: str,
    phone: str = "",
    avatar: str = "",
    role: str = UserRole.CLIENT
) -> User:
    """Create a new user"""
    if User.objects.filter(email=email).exists():
        raise DuplicateError("User with this email already exists")
    
    user = User.objects.create_user(
        email=email,
        password=password,
        name=name,
        phone=phone,
        avatar=avatar,
        role=role
    )
    return user


def update_user(user_id: str, **kwargs) -> User:
    """Update user data"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found")
    
    # Handle password separately
    if "password" in kwargs:
        user.set_password(kwargs.pop("password"))
    
    for field, value in kwargs.items():
        if hasattr(user, field) and field not in ["id", "created_at", "deleted_at"]:
            setattr(user, field, value)
    
    user.save()
    return user


def verify_user(user_id: str) -> User:
    """Mark user as verified"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found")
    
    user.is_verified = True
    user.save(update_fields=["is_verified", "updated_at"])
    return user


def delete_user(user_id: str) -> None:
    """Soft delete user"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found")
    
    user.soft_delete()