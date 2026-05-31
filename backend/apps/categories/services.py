from apps.categories.models import Category
from apps.users.exceptions import ValidationError, DuplicateError


def create_category(name: str, icon: str) -> Category:
    """Create a new category"""
    if Category.objects.filter(name=name).exists():
        raise DuplicateError("Category with this name already exists")
    
    category = Category.objects.create(name=name, icon=icon)
    return category


def update_category(category_id: str, **kwargs) -> Category:
    """Update category"""
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        raise ValidationError("Category not found")
    
    for field, value in kwargs.items():
        if hasattr(category, field) and field not in ["id", "created_at", "deleted_at"]:
            setattr(category, field, value)
    
    category.save()
    return category


def delete_category(category_id: str) -> None:
    """Soft delete category"""
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        raise ValidationError("Category not found")
    
    category.soft_delete()
