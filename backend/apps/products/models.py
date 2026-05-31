from django.db import models

from .base_models import BaseModel
from apps.categories.models import Category


class Product(BaseModel):
    name = models.CharField(max_length=150)
    brand = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products"
    )

    class Meta:
        db_table = "products_product"
        verbose_name = "Product"
        verbose_name_plural = "Products"
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["brand"]),
            models.Index(fields=["category"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["deleted_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "brand"],
                name="unique_product_name_brand"
            )
        ]

    def __str__(self):
        return f"{self.brand} - {self.name}"
