import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from './core/services/auth.service';

type NavItem = {
  label: string;
  path: string;
  icon: string;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUrl = signal(this.router.url);
  isUserMenuOpen = false;

  readonly user = this.authService.user;
  readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  readonly navItems = computed<NavItem[]>(() => {
    const role = this.user()?.role;

    if (role === 'STORE') {
      return [
        { label: 'Inventario', path: '/dashboard/inventory', icon: 'I' },
        { label: 'Mi tienda', path: '/dashboard/profile', icon: 'T' },
      ];
    }

    return [
      { label: 'Buscar', path: '/search', icon: 'B' },
      { label: 'Mapa', path: '/map', icon: 'M' },
      { label: 'Favoritos', path: '/favorites', icon: 'F' },
    ];
  });

  readonly showLayout = computed(() => {
    const url = this.currentUrl();
    const publicRoute = url.startsWith('/login') ||
      url.startsWith('/register') ||
      url.startsWith('/auth');

    return this.isAuthenticated() && !publicRoute;
  });

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentUrl.set(event.urlAfterRedirects);
      this.isUserMenuOpen = false;
    });

    if (this.authService.isAuthenticated()) {
      this.authService.loadProfile().subscribe({
        error: () => {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        },
      });
    }
  }

  initials(): string {
    const name = this.user()?.name || this.user()?.email || 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
