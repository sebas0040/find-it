import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { UserRole } from '../models';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!allowedRoles?.length) {
    return true;
  }

  const user = authService.user();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  return allowedRoles.includes(user.role)
    ? true
    : router.createUrlTree(['/']);
};
