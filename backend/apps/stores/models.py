from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.postgres.indexes import GistIndex
from django.conf import settings

from .base_models import BaseModel


class Store(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="stores"
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    address = models.TextField()
    location = gis_models.PointField(geography=True)
    verified = models.BooleanField(default=False)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0
    )

    class Meta:
        db_table = "stores_store"
        verbose_name = "Store"
        verbose_name_plural = "Stores"
        indexes = [
            models.Index(fields=["owner"]),
            models.Index(fields=["verified"]),
            models.Index(fields=["rating"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["deleted_at"]),
            GistIndex(fields=["location"]),
        ]

    def __str__(self):
        return self.name
