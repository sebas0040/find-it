from rest_framework.routers import DefaultRouter
from .views import SearchViewSet

router = DefaultRouter()
router.register(r'products', SearchViewSet, basename='search-products')

urlpatterns = router.urls
