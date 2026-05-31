from django.contrib import admin
from apps.reviews.models import Review, Favorite


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("user", "store", "rating", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("user__email", "store__name")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "deleted_at")


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "product__name")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "deleted_at")
