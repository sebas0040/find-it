from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, FavoriteViewSet

router = DefaultRouter()
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
]
