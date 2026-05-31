from django.contrib import admin
from apps.stores.models import Store


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "verified", "rating", "created_at")
    list_filter = ("verified", "rating", "created_at")
    search_fields = ("name", "owner__email", "address")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "deleted_at")
    list_select_related = ("owner",)
