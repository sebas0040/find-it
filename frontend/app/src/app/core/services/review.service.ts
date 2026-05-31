import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { Favorite, Review } from '../models';
import { PaginatedResponse } from './inventory.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = `${API_BASE_URL}/reviews/reviews`;
  private readonly favoritesUrl = `${API_BASE_URL}/reviews/favorites`;

  constructor(private readonly http: HttpClient) {}

  getStoreReviews(storeId: string | number, page = 1): Observable<PaginatedResponse<Review>> {
    return this.http.get<PaginatedResponse<Review>>(`${this.apiUrl}/`, {
      params: { store: storeId, page },
    });
  }

  createReview(payload: { store_id: string | number; rating: number; comment: string }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/`, payload);
  }

  updateReview(id: string | number, payload: Partial<Pick<Review, 'rating' | 'comment'>>): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${id}/`, payload);
  }

  deleteReview(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http
      .get<Favorite[] | PaginatedResponse<Favorite>>(`${this.favoritesUrl}/`)
      .pipe(map((response) => (Array.isArray(response) ? response : response.results)));
  }

  addFavorite(productId: string | number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.favoritesUrl}/`, { product_id: productId });
  }

  deleteFavorite(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.favoritesUrl}/${id}/`);
  }
}
