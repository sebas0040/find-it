from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.products.models import Product
from .serializers import ProductSerializer, ProductListSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(deleted_at__isnull=True).select_related('category')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'brand']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    @action(detail=False, methods=['get'])
    def my_products(self, request):
        """Get all products created by current user (store owner)"""
        from apps.inventory.serializers import InventoryListSerializer
        from apps.inventory.models import Inventory
        from apps.stores.models import Store
        from django.shortcuts import get_object_or_404
        
        store = get_object_or_404(Store, owner=request.user)
        inventories = Inventory.objects.filter(store=store, deleted_at__isnull=True)
        serializer = InventoryListSerializer(inventories, many=True)
        return Response(serializer.data)

