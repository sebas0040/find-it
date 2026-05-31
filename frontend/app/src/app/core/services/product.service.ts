import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { Category, Product, ProductListItem } from '../models';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${API_BASE_URL}/products`;

  constructor(private readonly http: HttpClient) {}

  getProducts(search?: string): Observable<ProductListItem[]> {
    return this.http
      .get<ProductListItem[] | PaginatedResponse<ProductListItem>>(`${this.apiUrl}/`, {
        params: search ? { search } : {},
      })
      .pipe(map((response) => this.toList(response)));
  }

  getProduct(id: string | number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}/`);
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[] | PaginatedResponse<Category>>(`${API_BASE_URL}/categories/`)
      .pipe(map((response) => this.toList(response)));
  }

  createProduct(payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/`, payload);
  }

  updateProduct(id: string | number, payload: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/`, payload);
  }

  private toList<T>(response: T[] | PaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results;
  }
}
