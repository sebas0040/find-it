import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap, throwError } from 'rxjs';

import {
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  AUTH_API_URL,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from '../constants/api.constants';
import {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  Store,
  TokenRefreshResponse,
  User,
  UserRole,
} from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = AUTH_API_URL;
  private readonly tokenState = signal<string | null>(
    localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
  );
  private readonly refreshTokenState = signal<string | null>(
    localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  );
  private readonly userState = signal<User | null>(
    this.readStoredUser(),
  );
  private readonly activeStoreState = signal<Store | null>(null);

  readonly token = this.tokenState.asReadonly();
  readonly refreshTokenValue = this.refreshTokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly activeStore = this.activeStoreState.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.setSession(response)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): void {
    this.clearSession();
  }

  refreshToken(refresh = this.refreshTokenState()): Observable<TokenRefreshResponse> {
    if (!refresh) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<TokenRefreshResponse>(`${this.apiUrl}/refresh`, { refresh })
      .pipe(tap((response) => this.setTokens(response)));
  }

  refreshAccessToken(refresh: string): Observable<TokenRefreshResponse> {
    return this.refreshToken(refresh);
  }

  loadProfile(): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/me`)
      .pipe(tap((user) => this.setUser(user)));
  }

  updateProfile(id: string | number, payload: Pick<Partial<User>, 'name' | 'phone' | 'avatar'>): Observable<User> {
    return this.http
      .patch<User>(`${API_BASE_URL}/users/${id}/`, payload)
      .pipe(tap((user) => this.setUser(user)));
  }

  setActiveStore(store: Store | null): void {
    this.activeStoreState.set(store);
  }

  getCurrentUser(): User | null {
    return this.userState();
  }

  setSession(response: AuthResponse): void {
    this.setTokens(response);
    this.setUser(response.user);
  }

  setTokens(response: TokenRefreshResponse): void {
    this.tokenState.set(response.access);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.access);

    if (response.refresh) {
      this.refreshTokenState.set(response.refresh);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, response.refresh);
    }
  }

  setUser(user: User): void {
    this.userState.set(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    this.tokenState.set(null);
    this.refreshTokenState.set(null);
    this.userState.set(null);
    this.activeStoreState.set(null);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.tokenState());
  }

  hasRole(role: UserRole): boolean {
    return this.userState()?.role === role;
  }

  private readStoredUser(): User | null {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
