from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

from .base_models import BaseModel
from apps.stores.models import Store
from apps.products.models import Product


class Review(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()

    class Meta:
        db_table = "reviews_review"
        verbose_name = "Review"
        verbose_name_plural = "Reviews"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["store"]),
            models.Index(fields=["rating"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["deleted_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "store"],
                name="unique_user_store_review"
            )
        ]

    def __str__(self):
        return f"Review by {self.user.email} for {self.store.name}"


class Favorite(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorites"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="favorites"
    )

    class Meta:
        db_table = "reviews_favorite"
        verbose_name = "Favorite"
        verbose_name_plural = "Favorites"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["product"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["deleted_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="unique_user_product_favorite"
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"
