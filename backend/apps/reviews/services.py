from apps.reviews.models import Review, Favorite
from apps.stores.models import Store
from apps.products.models import Product
from apps.users.models import User
from apps.users.exceptions import ValidationError, DuplicateError


def create_review(
    user_id: str,
    store_id: str,
    rating: int,
    comment: str
) -> Review:
    """Create a review"""
    if rating < 1 or rating > 5:
        raise ValidationError("Rating must be between 1 and 5")
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found")
    
    try:
        store = Store.objects.get(id=store_id)
    except Store.DoesNotExist:
        raise ValidationError("Store not found")
    
    if Review.objects.filter(user=user, store=store).exists():
        raise DuplicateError("You already reviewed this store")
    
    review = Review.objects.create(
        user=user,
        store=store,
        rating=rating,
        comment=comment
    )
    
    # Update store rating
    from django.db.models import Avg
    avg_rating = Review.objects.filter(store=store).aggregate(Avg("rating"))["rating__avg"]
    store.rating = avg_rating or 0
    store.save(update_fields=["rating", "updated_at"])
    
    return review


def update_review(review_id: str, rating: int = None, comment: str = None) -> Review:
    """Update a review"""
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        raise ValidationError("Review not found")
    
    if rating is not None:
        if rating < 1 or rating > 5:
            raise ValidationError("Rating must be between 1 and 5")
        review.rating = rating
    
    if comment is not None:
        review.comment = comment
    
    review.save()
    
    # Update store rating
    from django.db.models import Avg
    avg_rating = Review.objects.filter(store=review.store).aggregate(Avg("rating"))["rating__avg"]
    review.store.rating = avg_rating or 0
    review.store.save(update_fields=["rating", "updated_at"])
    
    return review


def delete_review(review_id: str) -> None:
    """Soft delete review"""
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        raise ValidationError("Review not found")
    
    store = review.store
    review.soft_delete()
    
    # Update store rating
    from django.db.models import Avg
    avg_rating = Review.objects.filter(store=store).aggregate(Avg("rating"))["rating__avg"]
    store.rating = avg_rating or 0
    store.save(update_fields=["rating", "updated_at"])


def add_to_favorites(user_id: str, product_id: str) -> Favorite:
    """Add product to favorites"""
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValidationError("User not found")
    
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        raise ValidationError("Product not found")
    
    if Favorite.objects.filter(user=user, product=product).exists():
        raise DuplicateError("This product is already in your favorites")
    
    favorite = Favorite.objects.create(user=user, product=product)
    return favorite


def remove_from_favorites(user_id: str, product_id: str) -> None:
    """Remove product from favorites"""
    try:
        favorite = Favorite.objects.get(user_id=user_id, product_id=product_id)
    except Favorite.DoesNotExist:
        raise ValidationError("Favorite not found")
    
    favorite.soft_delete()
