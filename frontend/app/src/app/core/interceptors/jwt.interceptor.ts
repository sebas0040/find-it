import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { AUTH_API_URL } from '../constants/api.constants';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();
  const isPublicAuthRequest =
    request.url === `${AUTH_API_URL}/login` ||
    request.url === `${AUTH_API_URL}/register` ||
    request.url === `${AUTH_API_URL}/refresh`;

  const authRequest =
    token && !isPublicAuthRequest
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : request;

  return next(authRequest).pipe(
    catchError((error: unknown) => {
      const refreshToken = authService.refreshTokenValue();

      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isPublicAuthRequest ||
        !refreshToken
      ) {
        return throwError(() => error);
      }

      return authService.refreshToken(refreshToken).pipe(
        switchMap(({ access }) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${access}`,
              },
            }),
          ),
        ),
        catchError((refreshError: unknown) => {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
