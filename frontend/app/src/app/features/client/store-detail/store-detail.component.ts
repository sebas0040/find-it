import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Inventory, Review, Store, User } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService, PaginatedResponse } from '../../../core/services/inventory.service';
import { ReviewService } from '../../../core/services/review.service';
import { StoreService } from '../../../core/services/store.service';

@Component({
  selector: 'app-store-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './store-detail.component.html',
  styleUrl: './store-detail.component.scss',
})
export class StoreDetailComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly storeService = inject(StoreService);
  private readonly inventoryService = inject(InventoryService);
  private readonly reviewService = inject(ReviewService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly reviewForm = this.formBuilder.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required]],
  });

  readonly currentUser = this.authService.user;

  store: Store | null = null;
  inventory: PaginatedResponse<Inventory> | null = null;
  reviews: PaginatedResponse<Review> | null = null;

  isLoadingStore = true;
  isLoadingInventory = false;
  isLoadingReviews = false;
  isSavingReview = false;
  isEditingReview = false;
  errorMessage = '';
  reviewError = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'No encontramos el identificador de la tienda.';
      this.isLoadingStore = false;
      return;
    }

    this.loadStore(id);
    this.loadInventory(id);
    this.loadReviews(id);
  }

  loadInventory(storeId: string | number, page = 1): void {
    this.isLoadingInventory = true;
    this.inventoryService
      .getStoreInventory(storeId, page)
      .pipe(
        finalize(() => {
          this.isLoadingInventory = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (inventory) => {
          this.inventory = inventory;
        },
      });
  }

  loadReviews(storeId: string | number, page = 1): void {
    this.isLoadingReviews = true;
    this.reviewService
      .getStoreReviews(storeId, page)
      .pipe(
        finalize(() => {
          this.isLoadingReviews = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (reviews) => {
          this.reviews = reviews;
        },
      });
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  ratingStars(rating: number | string): string[] {
    const value = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, index) => (index < value ? 'filled' : 'empty'));
  }

  averageRating(): number {
    const list = this.reviews?.results || [];

    if (!list.length) {
      return Number(this.store?.rating) || 0;
    }

    const total = list.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return Math.round((total / list.length) * 10) / 10;
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
    }).format(new Date(value));
  }

  myReview(): Review | null {
    const user = this.currentUser();

    if (!user || !this.reviews?.results?.length) {
      return null;
    }

    return this.reviews.results.find((review) => this.reviewBelongsToUser(review, user)) || null;
  }

  canCreateReview(): boolean {
    return Boolean(this.currentUser()) && !this.myReview();
  }

  setReviewRating(rating: number): void {
    this.reviewForm.controls.rating.setValue(rating);
    this.reviewForm.controls.rating.markAsDirty();
  }

  startEditReview(review: Review): void {
    this.isEditingReview = true;
    this.reviewError = '';
    this.reviewForm.reset({
      rating: review.rating,
      comment: review.comment,
    });
  }

  cancelEditReview(): void {
    this.isEditingReview = false;
    this.reviewError = '';
    this.reviewForm.reset({ rating: 5, comment: '' });
  }

  submitReview(): void {
    this.reviewError = '';

    if (!this.store) {
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    const value = this.reviewForm.getRawValue();
    const existingReview = this.myReview();
    this.isSavingReview = true;

    const request = existingReview && this.isEditingReview
      ? this.reviewService.updateReview(existingReview.id, {
          rating: value.rating,
          comment: value.comment.trim(),
        })
      : this.reviewService.createReview({
          store_id: this.store.id,
          rating: value.rating,
          comment: value.comment.trim(),
        });

    request
      .pipe(
        finalize(() => {
          this.isSavingReview = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (review) => {
          this.upsertReview(review);
          this.isEditingReview = false;
          this.reviewForm.reset({ rating: 5, comment: '' });
        },
        error: () => {
          this.reviewError = 'No pudimos guardar tu review.';
        },
      });
  }

  deleteMyReview(): void {
    const review = this.myReview();

    if (!review || !window.confirm('Eliminar tu review de esta tienda?')) {
      return;
    }

    this.isSavingReview = true;
    this.reviewService
      .deleteReview(review.id)
      .pipe(
        finalize(() => {
          this.isSavingReview = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          if (this.reviews) {
            this.reviews = {
              ...this.reviews,
              count: Math.max(0, this.reviews.count - 1),
              results: this.reviews.results.filter((item) => item.id !== review.id),
            };
          }
          this.cancelEditReview();
        },
        error: () => {
          this.reviewError = 'No pudimos eliminar tu review.';
        },
      });
  }

  goToInventoryPage(url: string | null): void {
    if (!this.store || !url) {
      return;
    }

    const page = this.pageFromUrl(url);
    this.loadInventory(this.store.id, page);
  }

  trackInventory(_: number, item: Inventory): string | number {
    return item.id;
  }

  trackReview(_: number, review: Review): string | number {
    return review.id;
  }

  private loadStore(id: string): void {
    this.isLoadingStore = true;
    this.storeService
      .getStore(id)
      .pipe(
        finalize(() => {
          this.isLoadingStore = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (store) => {
          this.store = store;
        },
        error: () => {
          this.errorMessage = 'No pudimos cargar la tienda.';
        },
      });
  }

  private upsertReview(review: Review): void {
    if (!this.reviews) {
      this.reviews = {
        count: 1,
        next: null,
        previous: null,
        results: [review],
      };
      return;
    }

    const exists = this.reviews.results.some((item) => item.id === review.id);
    this.reviews = {
      ...this.reviews,
      count: exists ? this.reviews.count : this.reviews.count + 1,
      results: exists
        ? this.reviews.results.map((item) => (item.id === review.id ? review : item))
        : [review, ...this.reviews.results],
    };
  }

  private pageFromUrl(url: string): number {
    try {
      return Number(new URL(url).searchParams.get('page') || 1);
    } catch {
      return 1;
    }
  }

  private reviewBelongsToUser(review: Review, user: User): boolean {
    if (review.user_id && review.user_id === user.id) {
      return true;
    }

    if (typeof review.user === 'object' && review.user?.id === user.id) {
      return true;
    }

    if (review.user === user.id) {
      return true;
    }

    return Boolean(review.user_name && review.user_name === user.name);
  }
}
