import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { rootRedirectGuard } from './core/guards/root-redirect.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'login',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: 'auth/register',
    pathMatch: 'full',
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  {
    path: 'search',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  {
    path: 'map',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/client/map/map.component').then((m) => m.MapComponent),
  },
  {
    path: 'favorites',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    loadComponent: () =>
      import('./features/client/favorites/favorites.component').then((m) => m.FavoritesComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/user-profile.component').then((m) => m.UserProfileComponent),
  },
  {
    path: 'stores/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT'] },
    loadComponent: () =>
      import('./features/client/store-detail/store-detail.component').then((m) => m.StoreDetailComponent),
  },
  {
    path: 'store',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STORE'] },
    loadChildren: () =>
      import('./features/store/store.routes').then((m) => m.STORE_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STORE'] },
    loadChildren: () =>
      import('./features/store/store.routes').then((m) => m.STORE_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    canActivate: [rootRedirectGuard],
    children: [],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
