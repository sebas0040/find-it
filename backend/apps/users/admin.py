from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "name", "role", "is_verified", "is_active", "created_at")
    list_filter = ("role", "is_verified", "is_active", "created_at")
    search_fields = ("email", "name", "phone")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at", "deleted_at", "last_login", "date_joined")
    
    fieldsets = (
        (None, {"fields": ("id", "email", "password")}),
        ("Personal info", {"fields": ("name", "phone", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Role", {"fields": ("role", "is_verified")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
        ("Timestamps", {"fields": ("created_at", "updated_at", "deleted_at"), "classes": ("collapse",)}),
    )
    
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2", "name", "role"),
        }),
    )

