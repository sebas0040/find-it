from django.db.models import QuerySet, Avg
from apps.reviews.models import Review, Favorite


def get_review_by_id(review_id: str) -> Review | None:
    """Get review by ID"""
    try:
        return Review.objects.select_related("user", "store").get(id=review_id)
    except Review.DoesNotExist:
        return None


def get_store_reviews(store_id: str) -> QuerySet:
    """Get all reviews for a store"""
    return Review.objects.filter(
        store_id=store_id
    ).select_related("user").order_by("-created_at")


def get_user_reviews(user_id: str) -> QuerySet:
    """Get all reviews by a user"""
    return Review.objects.filter(
        user_id=user_id
    ).select_related("store").order_by("-created_at")


def get_user_favorite_products(user_id: str) -> QuerySet:
    """Get all favorite products for a user"""
    return Favorite.objects.filter(
        user_id=user_id
    ).select_related("product").order_by("-created_at")


def get_product_favorites(product_id: str) -> QuerySet:
    """Get all users who favorited a product"""
    return Favorite.objects.filter(
        product_id=product_id
    ).select_related("user")


def get_average_store_rating(store_id: str) -> float:
    """Get average rating for a store"""
    from django.db.models import Avg
    result = Review.objects.filter(store_id=store_id).aggregate(avg_rating=Avg("rating"))
    return result["avg_rating"] or 0
