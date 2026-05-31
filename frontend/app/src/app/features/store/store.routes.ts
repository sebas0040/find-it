import { Routes } from '@angular/router';

export const STORE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard/store-dashboard.component').then((m) => m.StoreDashboardComponent),
  },
  {
    path: 'store-setup',
    loadComponent: () =>
      import('./store-setup/store-setup.component').then((m) => m.StoreSetupComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/store-profile.component').then((m) => m.StoreProfileComponent),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./inventory/store-inventory.component').then((m) => m.StoreInventoryComponent),
  },
];
