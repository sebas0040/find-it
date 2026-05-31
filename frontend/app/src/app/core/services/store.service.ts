import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import { Store, StoreListItem, StorePayload } from '../models';
import { AuthService } from './auth.service';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly apiUrl = `${API_BASE_URL}/stores`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getStores(): Observable<StoreListItem[]> {
    return this.http
      .get<StoreListItem[] | PaginatedResponse<StoreListItem>>(`${this.apiUrl}/`)
      .pipe(map((response) => this.toList(response)));
  }

  getNearbyStores(lat: number, lng: number, radius = 10): Observable<StoreListItem[]> {
    return this.http
      .get<StoreListItem[] | PaginatedResponse<StoreListItem>>(`${this.apiUrl}/`, {
        params: { lat, lng, radius },
      })
      .pipe(
        map((response) =>
          this.toList(response).sort(
            (first, second) => this.distanceValue(first.distance) - this.distanceValue(second.distance),
          ),
        ),
      );
  }

  getStore(id: string | number): Observable<Store> {
    return this.http.get<Store>(`${this.apiUrl}/${id}`);
  }

  getMyStore(): Observable<Store> {
    return this.http.get<Store>(`${this.apiUrl}/me`);
  }

  createStore(payload: StorePayload): Observable<Store> {
    return this.http.post<Store>(`${this.apiUrl}/`, payload);
  }

  updateMyStore(payload: Partial<StorePayload>): Observable<Store> {
    return this.http.patch<Store>(`${this.apiUrl}/me`, payload);
  }

  updateStore(id: string | number, payload: Partial<Store>): Observable<Store> {
    return this.http.patch<Store>(`${this.apiUrl}/${id}/`, payload);
  }

  getActiveStore(): Store | null {
    return this.authService.activeStore();
  }

  setActiveStore(store: Store | null): void {
    this.authService.setActiveStore(store);
  }

  private toList<T>(response: T[] | PaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results;
  }

  private distanceValue(distance: StoreListItem['distance']): number {
    if (typeof distance === 'number') {
      return distance;
    }

    if (distance && typeof distance === 'object' && 'km' in distance) {
      return distance.km;
    }

    return Number.POSITIVE_INFINITY;
  }
}
