import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { Inventory } from '../models';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = `${API_BASE_URL}/inventory`;

  constructor(private readonly http: HttpClient) {}

  getInventory(storeId?: string | number): Observable<Inventory[]> {
    return this.http
      .get<Inventory[] | PaginatedResponse<Inventory>>(`${this.apiUrl}/`, {
        params: storeId ? { store: storeId } : {},
      })
      .pipe(map((response) => this.toList(response)));
  }

  getInventoryItem(id: string | number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.apiUrl}/${id}/`);
  }

  getStoreInventory(storeId: string | number, page = 1): Observable<PaginatedResponse<Inventory>> {
    return this.http.get<PaginatedResponse<Inventory>>(
      `${API_BASE_URL}/stores/${storeId}/inventory`,
      { params: { page } },
    );
  }

  getMyProducts(): Observable<Inventory[]> {
    return this.http
      .get<Inventory[] | PaginatedResponse<Inventory>>(`${this.apiUrl}/my_products/`)
      .pipe(map((response) => this.toList(response)));
  }

  createInventoryItem(payload: Partial<Inventory>): Observable<Inventory> {
    return this.http.post<Inventory>(`${this.apiUrl}/`, payload);
  }

  updateInventoryItem(id: string | number, payload: Partial<Inventory>): Observable<Inventory> {
    return this.http.patch<Inventory>(`${this.apiUrl}/${id}/`, payload);
  }

  deleteInventoryItem(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  private toList<T>(response: T[] | PaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results;
  }
}
