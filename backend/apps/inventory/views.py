from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from apps.inventory.models import Inventory
from .serializers import InventorySerializer, InventoryListSerializer


class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.filter(deleted_at__isnull=True).select_related('product', 'store')
    serializer_class = InventorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store', 'product', 'available']
    search_fields = ['product__name', 'store__name']
    ordering_fields = ['created_at', 'price', 'stock']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return InventoryListSerializer
        return InventorySerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        inventory = self.get_object()
        store_owner = inventory.store.owner
        if store_owner != self.request.user and not self.request.user.is_superuser:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

    @action(detail=False, methods=['get'])
    def my_products(self, request):
        """Get all products for current user's store"""
        from django.shortcuts import get_object_or_404
        from apps.stores.models import Store
        
        store = get_object_or_404(Store, owner=request.user)
        inventories = Inventory.objects.filter(store=store, deleted_at__isnull=True)
        page = self.paginate_queryset(inventories)
        if page is not None:
            serializer = InventoryListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = InventoryListSerializer(inventories, many=True)
        return Response(serializer.data)

