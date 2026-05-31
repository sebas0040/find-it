from apps.inventory.models import Inventory
from apps.stores.models import Store
from apps.products.models import Product
from apps.users.exceptions import ValidationError, DuplicateError


def create_inventory(
    store_id: str,
    product_id: str,
    price: float,
    stock: int
) -> Inventory:
    """Create inventory entry"""
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        raise ValidationError("Store not found")
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ValidationError("Product not found")
    
    if Inventory.objects.filter(store_id=store_id, product_id=product_id).exists():
        raise DuplicateError("This product already exists in this store")
    
    inventory = Inventory.objects.create(
        store=store,
        product=product,
        price=price,
        stock=stock
    )
    return inventory


def update_inventory(inventory_id: str, **kwargs) -> Inventory:
    """Update inventory"""
    try:
        inventory = Inventory.objects.get(id=inventory_id)
    except Inventory.DoesNotExist:
        raise ValidationError("Inventory not found")
    
    for field, value in kwargs.items():
        if hasattr(inventory, field) and field not in ["id", "store", "product", "created_at", "deleted_at"]:
            setattr(inventory, field, value)
    
    inventory.save()
    return inventory


def update_stock(inventory_id: str, quantity: int) -> Inventory:
    """Update inventory stock"""
    try:
        inventory = Inventory.objects.get(id=inventory_id)
    except Inventory.DoesNotExist:
        raise ValidationError("Inventory not found")
    
    inventory.stock = max(0, inventory.stock + quantity)
    if inventory.stock == 0:
        inventory.available = False
    else:
        inventory.available = True
    
    inventory.save(update_fields=["stock", "available", "updated_at"])
    return inventory


def delete_inventory(inventory_id: str) -> None:
    """Soft delete inventory"""
    try:
        inventory = Inventory.objects.get(id=inventory_id)
    except Inventory.DoesNotExist:
        raise ValidationError("Inventory not found")
    
    inventory.soft_delete()
