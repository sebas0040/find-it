from django.db.models import QuerySet
from apps.products.models import Product


def get_product_by_id(product_id: str) -> Product | None:
    """Get product by ID"""
    try:
        return Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return None


def search_products(
    query: str = "",
    category_id: str = None,
    brand: str = None
) -> QuerySet:
    """Search products"""
    qs = Product.objects.select_related("category")
    
    if query:
        qs = qs.filter(name__icontains=query) | qs.filter(brand__icontains=query)
    
    if category_id:
        qs = qs.filter(category_id=category_id)
    
    if brand:
        qs = qs.filter(brand__icontains=brand)
    
    return qs.order_by("-created_at")


def get_products_by_category(category_id: str) -> QuerySet:
    """Get all products in a category"""
    return Product.objects.filter(category_id=category_id).order_by("name")
