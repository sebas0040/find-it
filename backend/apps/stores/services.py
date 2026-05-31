from django.contrib.gis.geos import Point
from apps.stores.models import Store
from apps.users.models import UserRole
from apps.users.exceptions import ValidationError, PermissionDeniedError


def create_store(
    owner_id: str,
    name: str,
    address: str,
    latitude: float,
    longitude: float,
    description: str = ""
) -> Store:
    """Create a new store"""
    from apps.users.models import User
    
    try:
        owner = User.objects.get(id=owner_id)
    except User.DoesNotExist:
        raise ValidationError("Owner not found")

    if owner.role != UserRole.STORE:
        raise PermissionDeniedError("Only store users can create stores")
    
    location = Point(float(longitude), float(latitude), srid=4326)
    
    store = Store.objects.create(
        owner=owner,
        name=name,
        address=address,
        location=location,
        description=description
    )
    return store


def update_store(store_id: str, **kwargs) -> Store:
    """Update store data"""
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        raise ValidationError("Store not found")
    
    # Handle location separately
    if "latitude" in kwargs and "longitude" in kwargs:
        store.location = Point(float(kwargs.pop("longitude")), float(kwargs.pop("latitude")), srid=4326)
    
    for field, value in kwargs.items():
        if hasattr(store, field) and field not in ["id", "created_at", "deleted_at"]:
            setattr(store, field, value)
    
    store.save()
    return store


def verify_store(store_id: str) -> Store:
    """Mark store as verified"""
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        raise ValidationError("Store not found")
    
    store.verified = True
    store.save(update_fields=["verified", "updated_at"])
    return store


def update_store_rating(store_id: str, rating: float) -> Store:
    """Update store rating"""
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        raise ValidationError("Store not found")
    
    store.rating = min(max(rating, 0), 5)
    store.save(update_fields=["rating", "updated_at"])
    return store


def delete_store(store_id: str) -> None:
    """Soft delete store"""
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        raise ValidationError("Store not found")
    
    store.soft_delete()
