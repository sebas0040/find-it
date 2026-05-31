from django.db.models import QuerySet
from apps.categories.models import Category


def get_category_by_id(category_id: str) -> Category | None:
    """Get category by ID"""
    try:
        return Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        return None


def get_all_categories() -> QuerySet:
    """Get all categories"""
    return Category.objects.all().order_by("name")


def search_categories(query: str = "") -> QuerySet:
    """Search categories"""
    qs = get_all_categories()
    
    if query:
        qs = qs.filter(name__icontains=query)
    
    return qs.order_by("name")
