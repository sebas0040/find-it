import uuid
from django.db import models


class BaseModel(models.Model):
    """Abstract base model with UUID primary key and soft delete support."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        abstract = True
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['deleted_at']),
        ]

    def delete(self, *args, **kwargs):
        """Soft delete: mark as deleted instead of removing."""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft-deleted instance."""
        self.deleted_at = None
        self.save()

    @classmethod
    def all_objects(cls):
        """Get all objects including soft-deleted ones."""
        return cls.objects.all()

    @classmethod
    def active_objects(cls):
        """Get only non-deleted objects."""
        return cls.objects.filter(deleted_at__isnull=True)

    objects = models.Manager()
