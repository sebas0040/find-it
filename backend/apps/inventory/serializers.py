from rest_framework import serializers
from apps.inventory.models import Inventory
from apps.products.models import Product
from apps.stores.models import Store
from apps.products.serializers import ProductListSerializer
from apps.stores.api_serializers import StoreListSerializer


class InventorySerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source='product'
    )
    store_id = serializers.PrimaryKeyRelatedField(
        queryset=Store.objects.all(), write_only=True, source='store'
    )

    class Meta:
        model = Inventory
        fields = ['id', 'product', 'product_id', 'store', 'store_id',
                  'price', 'stock', 'available', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['product_id'].queryset = Product.objects.filter(deleted_at__isnull=True)
        self.fields['store_id'].queryset = Store.objects.filter(deleted_at__isnull=True)


class InventoryListSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = Inventory
        fields = [
            'id',
            'product',
            'product_name',
            'store',
            'store_name',
            'price',
            'stock',
            'available',
            'created_at',
            'updated_at',
        ]
