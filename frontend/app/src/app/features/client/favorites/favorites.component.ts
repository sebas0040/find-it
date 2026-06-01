import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Favorite } from '../../../core/models';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
})
export class FavoritesComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly destroyRef = inject(DestroyRef);

  favorites: Favorite[] = [];
  isLoading = true;
  deletingId: string | number | null = null;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadFavorites();
  }

  removeFavorite(favorite: Favorite): void {
    const confirmed = window.confirm('¿Deseas eliminar este favorito?');

    if (!confirmed) {
      return;
    }

    this.deletingId = favorite.id;
    this.successMessage = '';
    this.errorMessage = '';

    this.reviewService
      .deleteFavorite(favorite.id)
      .pipe(
        finalize(() => {
          this.deletingId = null;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.favorites = this.favorites.filter((item) => item.id !== favorite.id);
          this.successMessage = 'Favorito eliminado correctamente.';
        },
        error: () => {
          this.errorMessage = 'No pudimos eliminar este favorito.';
        },
      });
  }

  productName(favorite: Favorite): string {
    return favorite.product?.name || favorite.product_name || 'Producto favorito';
  }

  productBrand(favorite: Favorite): string {
    return favorite.product?.brand || 'Marca no especificada';
  }

  productCategory(favorite: Favorite): string {
    const category = favorite.product?.category;

    if (typeof category === 'object' && category !== null) {
      return category.name;
    }

    return category ? String(category) : 'Sin categoria';
  }

  trackFavorite(_: number, favorite: Favorite): string | number {
    return favorite.id;
  }

  private loadFavorites(): void {
    this.isLoading = true;
    this.reviewService
      .getFavorites()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (favorites) => {
          this.favorites = favorites;
        },
        error: () => {
          this.errorMessage = 'No pudimos cargar tus favoritos.';
        },
      });
  }
}
