from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.contrib.gis.geos import Point
from django.db.models import Q, QuerySet, DecimalField, FloatField
from apps.inventory.models import Inventory


def search_products_with_nearby_stores(
    query: str = "",
    latitude: float = None,
    longitude: float = None,
    radius_km: float = 10,
    category_id: str = None,
) -> QuerySet:
    """
    Search for products with inventory from nearby stores.

    Uses PostGIS to find stores within radius and returns product-inventory results
    ordered by price ascending.
    """
    if latitude is None or longitude is None:
        return Inventory.objects.none()

    # Create a Point from user coordinates (SRID 4326 = WGS 84)
    user_point = Point(float(longitude), float(latitude), srid=4326)

    # Start with inventory queryset
    qs = Inventory.objects.select_related('store', 'product__category').filter(
        deleted_at__isnull=True,
        store__deleted_at__isnull=True,
        product__deleted_at__isnull=True,
        available=True,
        stock__gt=0,
    )

    # Filter stores within radius and annotate distance
    qs = qs.annotate(
        distance=Distance('store__location', user_point)
    ).filter(
        store__location__distance_lte=(user_point, D(km=float(radius_km)))
    )

    # Search products by name, brand, or description
    if query:
        qs = qs.filter(
            Q(product__name__icontains=query) |
            Q(product__brand__icontains=query) |
            Q(product__description__icontains=query)
        )

    # Filter by category if provided
    if category_id:
        qs = qs.filter(product__category_id=category_id)

    # Order by price ascending, then by distance
    return qs.order_by('price', 'distance')
