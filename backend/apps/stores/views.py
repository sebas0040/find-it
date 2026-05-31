from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from apps.users.permissions import IsAdmin
from .permissions import IsStoreOwnerOrAdmin, IsStoreUser
from .selectors import get_nearby_stores, store_queryset
from .api_serializers import StoreSerializer, StoreListSerializer, StoreCreateUpdateSerializer


class StorePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class StoreViewSet(viewsets.ModelViewSet):
    serializer_class = StoreSerializer
    pagination_class = StorePagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['verified']
    search_fields = ['name', 'address']
    ordering_fields = ['created_at', 'name', 'rating']
    ordering = ['-rating']

    def get_queryset(self):
        latitude = self.request.query_params.get("lat")
        longitude = self.request.query_params.get("lng")
        radius = self.request.query_params.get("radius")

        if latitude is None and longitude is None and radius is None:
            return store_queryset().order_by("-rating", "-created_at")

        if not latitude or not longitude:
            raise ValidationError({"location": "lat and lng are required for geographic filtering."})

        try:
            radius_km = float(radius) if radius is not None else 10
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError as exc:
            raise ValidationError({"location": "lat, lng and radius must be valid numbers."}) from exc

        if radius_km <= 0:
            raise ValidationError({"radius": "radius must be greater than 0."})

        return get_nearby_stores(latitude=latitude, longitude=longitude, radius_km=radius_km)

    def get_serializer_class(self):
        if self.action == 'create':
            return StoreCreateUpdateSerializer
        elif self.action in ['update', 'partial_update']:
            return StoreCreateUpdateSerializer
        elif self.action == 'list':
            return StoreListSerializer
        return StoreSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated(), IsStoreUser()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsStoreOwnerOrAdmin()]
        elif self.action == "verify":
            return [IsAuthenticated(), IsAdmin()]
        return [AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(StoreSerializer(serializer.instance).data, status=201)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(StoreSerializer(serializer.instance).data)
    
    def perform_destroy(self, instance):
        instance.soft_delete()

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        store = self.get_object()
        store.verified = True
        store.save(update_fields=["verified", "updated_at"])
        serializer = self.get_serializer(store)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def inventory(self, request, pk=None):
        from apps.inventory.models import Inventory
        from apps.inventory.serializers import InventorySerializer
        
        store = self.get_object()
        inventories = Inventory.objects.filter(store=store)
        page = self.paginate_queryset(inventories)
        if page is not None:
            serializer = InventorySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = InventorySerializer(inventories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """Get or update current store owner's store"""
        from django.shortcuts import get_object_or_404
        store = get_object_or_404(self.get_queryset().model, owner=request.user)
        
        if request.method in ['PATCH', 'PUT']:
            serializer = StoreCreateUpdateSerializer(store, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(StoreSerializer(serializer.instance).data)
        
        serializer = StoreSerializer(store)
        return Response(serializer.data)

