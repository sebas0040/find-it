import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Category, Favorite } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { LocationService } from '../../../core/services/location.service';
import {
  PaginatedResponse,
  SearchResult,
  SearchService,
} from '../../../core/services/search.service';
import { ProductService } from '../../../core/services/product.service';
import { ReviewService } from '../../../core/services/review.service';

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unsupported';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly searchService = inject(SearchService);
  private readonly productService = inject(ProductService);
  private readonly reviewService = inject(ReviewService);
  private readonly authService = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly searchForm = this.formBuilder.nonNullable.group({
    q: [''],
    category: [''],
    radius: [10],
    manualLocation: [''],
  });

  readonly radiusOptions = [1, 5, 10, 25];
  readonly skeletonItems = Array.from({ length: 6 });

  categories: Category[] = [];
  favorites: Favorite[] = [];
  response: PaginatedResponse<SearchResult> | null = null;
  selectedResult: SearchResult | null = null;
  detailResult: SearchResult | null = null;

  locationStatus: LocationStatus = 'idle';
  isLoadingCategories = false;
  isLoadingResults = false;
  isLoadingDetail = false;
  searchError = '';
  detailError = '';
  favoriteError = '';
  togglingFavoriteProductId: string | number | null = null;

  ngOnInit(): void {
    this.loadCategories();
    this.loadFavorites();
    this.requestLocation();
  }

  requestLocation(): void {
    this.searchError = '';

    if (!navigator.geolocation) {
      this.locationStatus = 'unsupported';
      return;
    }

    this.locationStatus = 'loading';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locationService.setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        this.locationStatus = 'granted';
        this.search();
      },
      () => {
        this.locationStatus = 'denied';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  search(page = 1): void {
    const location = this.locationService.currentLocation();

    if (!location) {
      this.searchError = 'Activa tu ubicacion para buscar productos cerca de ti.';
      return;
    }

    const { q, radius, category } = this.searchForm.getRawValue();
    this.searchError = '';
    this.isLoadingResults = true;
    this.response = page === 1 ? null : this.response;

    this.searchService
      .searchProducts({
        lat: location.lat,
        lng: location.lng,
        q: q.trim(),
        radius,
        category: category || undefined,
        page,
      })
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.response = response;
        },
        error: () => {
          this.searchError = 'No pudimos cargar resultados. Intentalo nuevamente.';
        },
      });
  }

  openDetail(result: SearchResult): void {
    const location = this.locationService.currentLocation();

    if (!location) {
      return;
    }

    this.selectedResult = result;
    this.detailResult = null;
    this.detailError = '';
    this.isLoadingDetail = true;

    this.searchService
      .getProductResult(result.inventory.id, location.lat, location.lng)
      .pipe(
        finalize(() => {
          this.isLoadingDetail = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (detail) => {
          this.detailResult = detail;
        },
        error: () => {
          this.detailError = 'No pudimos cargar el detalle de este producto.';
        },
      });
  }

  closeDetail(): void {
    this.selectedResult = null;
    this.detailResult = null;
    this.detailError = '';
  }

  goToNextPage(): void {
    const page = this.getPageFromUrl(this.response?.next);
    if (page) {
      this.search(page);
    }
  }

  goToPreviousPage(): void {
    const page = this.getPageFromUrl(this.response?.previous);
    if (page) {
      this.search(page);
    }
  }

  openStoreMap(result: SearchResult, event?: Event): void {
    event?.stopPropagation();
    this.router.navigate(['/map'], { queryParams: { store: result.store.id } });
  }

  toggleFavorite(result: SearchResult, event: Event): void {
    event.stopPropagation();
    this.favoriteError = '';

    if (this.authService.user()?.role !== 'CLIENT') {
      this.favoriteError = 'Solo clientes pueden guardar favoritos.';
      return;
    }

    const productId = result.product.id;
    const favorite = this.favoriteForProduct(productId);
    this.togglingFavoriteProductId = productId;

    if (favorite) {
      this.reviewService
        .deleteFavorite(favorite.id)
        .pipe(
          finalize(() => {
            this.togglingFavoriteProductId = null;
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.favorites = this.favorites.filter((item) => item.id !== favorite.id);
          },
          error: () => {
            this.favoriteError = 'No pudimos actualizar favoritos.';
          },
        });
      return;
    }

    this.reviewService
      .addFavorite(productId)
      .pipe(
        finalize(() => {
          this.togglingFavoriteProductId = null;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (createdFavorite) => {
          this.favorites = [...this.favorites, createdFavorite];
        },
        error: () => {
          this.favoriteError = 'No pudimos actualizar favoritos.';
        },
      });
  }

  isFavorite(productId: string | number): boolean {
    return Boolean(this.favoriteForProduct(productId));
  }

  isFavoriteLoading(productId: string | number): boolean {
    return this.togglingFavoriteProductId === productId;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  distanceLabel(result: SearchResult): string {
    const distance = result.distance ?? result.store.distance;

    if (typeof distance === 'number') {
      return `${distance} km`;
    }

    if (distance && typeof distance === 'object' && 'km' in distance) {
      return `${(distance as { km: number }).km} km`;
    }

    return '-';
  }

  trackResult(_: number, result: SearchResult): string | number {
    return result.inventory.id;
  }

  private favoriteForProduct(productId: string | number): Favorite | undefined {
    return this.favorites.find((favorite) => {
      const favoriteProductId = favorite.product?.id ?? favorite.product_id;
      return favoriteProductId === productId;
    });
  }

  private loadFavorites(): void {
    if (this.authService.user()?.role !== 'CLIENT') {
      return;
    }

    this.reviewService
      .getFavorites()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (favorites) => {
          this.favorites = favorites;
        },
      });
  }

  private loadCategories(): void {
    this.isLoadingCategories = true;
    this.searchForm.controls.category.disable({ emitEvent: false });

    this.productService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoadingCategories = false;
          this.searchForm.controls.category.enable({ emitEvent: false });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
      });
  }

  private getPageFromUrl(url?: string | null): number | null {
    if (!url) {
      return null;
    }

    try {
      const parsedUrl = new URL(url);
      const page = parsedUrl.searchParams.get('page');
      return page ? Number(page) : 1;
    } catch {
      return null;
    }
  }
}
