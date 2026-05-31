from apps.products.models import Product
from apps.categories.models import Category
from apps.users.exceptions import ValidationError


def create_product(
    name: str,
    brand: str,
    category_id: str,
    description: str = "",
    image: str = ""
) -> Product:
    """Create a new product"""
    try:
        category = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        raise ValidationError("Category not found")
    
    product = Product.objects.create(
        name=name,
        brand=brand,
        category=category,
        description=description,
        image=image
    )
    return product


def update_product(product_id: str, **kwargs) -> Product:
    """Update product"""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ValidationError("Product not found")
    
    for field, value in kwargs.items():
        if hasattr(product, field) and field not in ["id", "created_at", "deleted_at"]:
            setattr(product, field, value)
    
    product.save()
    return product


def delete_product(product_id: str) -> None:
    """Soft delete product"""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ValidationError("Product not found")
    
    product.soft_delete()
