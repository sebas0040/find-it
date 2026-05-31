from django.contrib import admin
from apps.inventory.models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ("store", "product", "price", "stock", "available", "created_at")
    list_filter = ("store", "available", "created_at")
    search_fields = ("store__name", "product__name")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "deleted_at")
