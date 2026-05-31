from rest_framework import serializers
from apps.inventory.models import Inventory
from apps.products.serializers import ProductSerializer
from apps.stores.api_serializers import StoreListSerializer


class SearchResultSerializer(serializers.Serializer):
    """Serializer for search results combining product, inventory, and store data."""

    product = ProductSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
    inventory = serializers.SerializerMethodField()
    distance = serializers.SerializerMethodField()

    def get_inventory(self, obj):
        """Return inventory item details."""
        return {
            'id': str(obj.id),
            'price': float(obj.price),
            'stock': obj.stock,
            'available': obj.available,
            'created_at': obj.created_at.isoformat(),
            'updated_at': obj.updated_at.isoformat(),
        }

    def get_distance(self, obj):
        """Convert distance annotation to kilometers."""
        if hasattr(obj, 'distance') and obj.distance:
            return round(obj.distance.km, 2)
        return None
