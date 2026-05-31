import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { Product, StoreListItem } from '../models';

export interface ProductSearchParams {
  q?: string;
  lat: number;
  lng: number;
  radius?: number;
  category?: string | number;
  page?: number;
}

export interface SearchInventory {
  id: string | number;
  price: number;
  stock: number;
  available: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SearchStore extends Omit<StoreListItem, 'distance'> {
  distance: number | { m: number; km: number } | null;
}

export interface SearchResult {
  product: Product;
  store: SearchStore;
  inventory: SearchInventory;
  distance: number | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly apiUrl = `${API_BASE_URL}/search`;

  constructor(private readonly http: HttpClient) {}

  searchProducts(params: ProductSearchParams): Observable<PaginatedResponse<SearchResult>>;
  searchProducts(
    lat: number,
    lng: number,
    q?: string,
    radius?: number,
    category?: string | number,
  ): Observable<PaginatedResponse<SearchResult>>;
  searchProducts(
    paramsOrLat: ProductSearchParams | number,
    lng?: number,
    q?: string,
    radius?: number,
    category?: string | number,
  ): Observable<PaginatedResponse<SearchResult>> {
    const params =
      typeof paramsOrLat === 'number'
        ? {
            lat: paramsOrLat,
            lng: lng as number,
            q,
            radius,
            category,
          }
        : paramsOrLat;

    return this.http.get<PaginatedResponse<SearchResult>>(`${this.apiUrl}/products/`, {
      params: {
        lat: params.lat,
        lng: params.lng,
        radius: params.radius ?? 10,
        ...(params.q ? { q: params.q } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.page ? { page: params.page } : {}),
      },
    });
  }

  getProductResult(id: string | number, lat: number, lng: number): Observable<SearchResult> {
    return this.http.get<SearchResult>(`${this.apiUrl}/products/${id}/`, {
      params: { lat, lng },
    });
  }
}
