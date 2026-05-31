from django.db import models

from .base_models import BaseModel
from apps.stores.models import Store
from apps.products.models import Product


class Inventory(BaseModel):
    store = models.ForeignKey(
        Store,
        on_delete=models.CASCADE,
        related_name="inventories"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventories"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    available = models.BooleanField(default=True)

    class Meta:
        db_table = "inventory_inventory"
        verbose_name = "Inventory"
        verbose_name_plural = "Inventories"
        indexes = [
            models.Index(fields=["store"]),
            models.Index(fields=["product"]),
            models.Index(fields=["available"]),
            models.Index(fields=["price"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["deleted_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["store", "product"],
                name="unique_store_product"
            )
        ]

    def __str__(self):
        return f"{self.store.name} - {self.product.name}"
