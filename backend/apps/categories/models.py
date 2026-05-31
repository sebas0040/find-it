from django.db import models

from .base_models import BaseModel


class Category(BaseModel):
    name = models.CharField(max_length=80, unique=True)
    icon = models.CharField(max_length=50)

    class Meta:
        db_table = "categories_category"
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["deleted_at"]),
        ]

    def __str__(self):
        return self.name
