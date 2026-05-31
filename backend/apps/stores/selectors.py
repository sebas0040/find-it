from django.db.models import QuerySet
from django.contrib.gis.geos import Point
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from apps.stores.models import Store


def store_queryset() -> QuerySet:
    """Base queryset optimized for store reads."""
    return Store.objects.select_related("owner")


def get_store_by_id(store_id: str) -> Store | None:
    """Get store by ID"""
    try:
        return store_queryset().get(id=store_id)
    except Store.DoesNotExist:
        return None


def search_stores(query: str = "", verified: bool = None) -> QuerySet:
    """Search stores by name or description"""
    qs = store_queryset()
    
    if query:
        qs = qs.filter(name__icontains=query) | qs.filter(description__icontains=query)
    
    if verified is not None:
        qs = qs.filter(verified=verified)
    
    return qs.order_by("-rating", "-created_at")


def get_stores_by_owner(owner_id: str) -> QuerySet:
    """Get all stores owned by a user"""
    return store_queryset().filter(owner_id=owner_id).order_by("-created_at")


def get_nearby_stores(latitude: float, longitude: float, radius_km: float = 10) -> QuerySet:
    """Get stores near a location (within radius in km)"""
    point = Point(float(longitude), float(latitude), srid=4326)
    return (
        store_queryset()
        .filter(location__distance_lte=(point, D(km=float(radius_km))))
        .annotate(distance=Distance("location", point))
        .order_by("distance", "-rating")
    )


def get_verified_stores() -> QuerySet:
    """Get all verified stores"""
    return store_queryset().filter(verified=True).order_by("-rating", "-created_at")
