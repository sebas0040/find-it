from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .selectors import search_products_with_nearby_stores
from .serializers import SearchResultSerializer


class SearchPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SearchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Search products across nearby stores using geospatial queries.

    Query Parameters:
    - q: Search query (product name, brand, description)
    - lat: User latitude (required)
    - lng: User longitude (required)
    - radius: Search radius in km (default 10)
    - category: Filter by category UUID (optional)
    """

    serializer_class = SearchResultSerializer
    permission_classes = [AllowAny]
    pagination_class = SearchPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    ordering = ['price']
    ordering_fields = ['price']

    def get_queryset(self):
        """Build queryset from query parameters."""
        from apps.inventory.models import Inventory
        
        query = self.request.query_params.get('q', '')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 10)
        category = self.request.query_params.get('category')

        # Validate required parameters
        if not lat or not lng:
            return Inventory.objects.none()

        try:
            lat = float(lat)
            lng = float(lng)
            radius = float(radius)
        except (ValueError, TypeError):
            return Inventory.objects.none()

        return search_products_with_nearby_stores(
            query=query,
            latitude=lat,
            longitude=lng,
            radius_km=radius,
            category_id=category,
        )

    def list(self, request, *args, **kwargs):
        """Search endpoint handler."""
        # Validate coordinates
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')

        if not lat or not lng:
            return Response(
                {
                    'error': 'Missing required parameters',
                    'required': ['lat', 'lng'],
                    'optional': ['q', 'radius', 'category']
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().list(request, *args, **kwargs)
