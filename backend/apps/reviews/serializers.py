from rest_framework import serializers
from apps.reviews.models import Review, Favorite
from apps.products.models import Product
from apps.stores.models import Store
from apps.users.api.serializers import UserListSerializer
from apps.stores.api_serializers import StoreListSerializer
from apps.products.serializers import ProductListSerializer


class ReviewSerializer(serializers.ModelSerializer):
    user = UserListSerializer(read_only=True)
    store = StoreListSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(read_only=True)
    store_id = serializers.PrimaryKeyRelatedField(
        queryset=Store.objects.all(), write_only=True, source='store'
    )

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_id', 'store', 'store_id',
                  'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['store_id'].queryset = Store.objects.filter(deleted_at__isnull=True)


class ReviewListSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user_id', 'user_name', 'store_name', 'rating', 'comment', 'created_at']


class FavoriteSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(read_only=True)
    product = ProductListSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), write_only=True, source='product'
    )

    class Meta:
        model = Favorite
        fields = ['id', 'user_id', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'user_id', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['product_id'].queryset = Product.objects.filter(deleted_at__isnull=True)


class FavoriteListSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_name', 'created_at']
