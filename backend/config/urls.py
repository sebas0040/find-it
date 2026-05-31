"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from config.views import healthcheck
from apps.categories.views import CategoryViewSet
from apps.stores.views import StoreViewSet

store_list = StoreViewSet.as_view({"get": "list", "post": "create"})
store_detail = StoreViewSet.as_view({
    "get": "retrieve",
    "patch": "partial_update",
    "put": "update",
    "delete": "destroy",
})
category_list = CategoryViewSet.as_view({"get": "list"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', healthcheck, name='healthcheck-no-slash'),
    path('api/health/', healthcheck, name='healthcheck'),
    path('api/auth/', include('apps.users.api.auth_urls')),
    path('api/stores', store_list, name='store-list'),
    path('api/stores/<uuid:pk>', store_detail, name='store-detail'),
    path('api/categories', category_list, name='category-list'),
    path('api/v1/users/', include('apps.users.api.urls')),
    path('api/v1/stores/', include('apps.stores.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
    path('api/v1/categories/', include('apps.categories.urls')),
    path('api/v1/search/', include('apps.search.urls')),
]

