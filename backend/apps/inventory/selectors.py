from django.db.models import QuerySet, Q
from apps.inventory.models import Inventory


def get_inventory_by_id(inventory_id: str) -> Inventory | None:
    """Get inventory by ID"""
    try:
        return Inventory.objects.select_related("store", "product").get(id=inventory_id)
    except Inventory.DoesNotExist:
        return None


def get_store_inventory(store_id: str) -> QuerySet:
    """Get all inventory for a store"""
    return Inventory.objects.filter(
        store_id=store_id
    ).select_related("product").order_by("product__name")


def get_product_inventory(product_id: str) -> QuerySet:
    """Get all stores that have a product"""
    return Inventory.objects.filter(
        product_id=product_id
    ).select_related("store").order_by("-store__rating")


def search_inventory(
    store_id: str = None,
    product_id: str = None,
    available: bool = None
) -> QuerySet:
    """Search inventory"""
    qs = Inventory.objects.select_related("store", "product")
    
    if store_id:
        qs = qs.filter(store_id=store_id)
    
    if product_id:
        qs = qs.filter(product_id=product_id)
    
    if available is not None:
        qs = qs.filter(available=available)
    
    return qs.order_by("-product__name")
