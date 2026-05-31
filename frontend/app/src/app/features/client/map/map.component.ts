import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';
import { finalize } from 'rxjs';

import { StoreListItem } from '../../../core/models';
import { LocationService } from '../../../core/services/location.service';
import { StoreService } from '../../../core/services/store.service';

type LocationStatus = 'loading' | 'granted' | 'denied' | 'unsupported';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly storeService = inject(StoreService);
  private readonly locationService = inject(LocationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly markers = new Map<string | number, L.Marker>();

  private map: L.Map | null = null;

  stores: StoreListItem[] = [];
  selectedStore: StoreListItem | null = null;
  locationStatus: LocationStatus = 'loading';
  isLoadingStores = false;
  errorMessage = '';

  ngAfterViewInit(): void {
    this.requestLocation();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  selectStore(store: StoreListItem): void {
    this.selectedStore = store;
    const marker = this.markers.get(store.id);

    if (!this.map || !marker) {
      return;
    }

    this.map.setView(marker.getLatLng(), 16, { animate: true });
    marker.openPopup();
  }

  retryLocation(): void {
    this.requestLocation();
  }

  ratingStars(rating: StoreListItem['rating']): string[] {
    const value = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, index) => (index < value ? 'filled' : 'empty'));
  }

  distanceLabel(store: StoreListItem): string {
    const distance = store.distance;

    if (typeof distance === 'number') {
      return `${distance.toFixed(distance < 10 ? 1 : 0)} km`;
    }

    if (distance && typeof distance === 'object' && 'km' in distance) {
      return `${distance.km.toFixed(distance.km < 10 ? 1 : 0)} km`;
    }

    return '-';
  }

  trackStore(_: number, store: StoreListItem): string | number {
    return store.id;
  }

  private requestLocation(): void {
    this.errorMessage = '';

    if (!navigator.geolocation) {
      this.locationStatus = 'unsupported';
      this.errorMessage = 'Tu navegador no soporta geolocalizacion.';
      return;
    }

    this.locationStatus = 'loading';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        this.locationService.setLocation(location);
        this.locationStatus = 'granted';
        this.initMap(location.lat, location.lng);
        this.loadStores(location.lat, location.lng);
      },
      () => {
        this.locationStatus = 'denied';
        this.errorMessage = 'Activa tu ubicacion para ver tiendas cercanas.';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  private initMap(lat: number, lng: number): void {
    if (this.map) {
      this.map.setView([lat, lng], 14);
      return;
    }

    this.map = L.map('nearby-stores-map', {
      zoomControl: true,
      attributionControl: true,
    }).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([lat, lng], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: '<span></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    })
      .bindPopup('Tu ubicacion')
      .addTo(this.map);
  }

  private loadStores(lat: number, lng: number): void {
    this.isLoadingStores = true;

    this.storeService
      .getNearbyStores(lat, lng, 10)
      .pipe(
        finalize(() => {
          this.isLoadingStores = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (stores) => {
          this.stores = stores;
          this.renderStoreMarkers();
          const requestedStore = this.router.parseUrl(this.router.url).queryParams['store'];
          const selected = stores.find((store) => String(store.id) === String(requestedStore));

          if (selected) {
            setTimeout(() => this.selectStore(selected));
          }
        },
        error: () => {
          this.errorMessage = 'No pudimos cargar tiendas cercanas.';
        },
      });
  }

  private renderStoreMarkers(): void {
    if (!this.map) {
      return;
    }

    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();

    this.stores.forEach((store) => {
      if (!store.location?.latitude || !store.location?.longitude) {
        return;
      }

      const marker = L.marker([store.location.latitude, store.location.longitude], {
        icon: L.divIcon({
          className: 'store-marker',
          html: '<span></span>',
          iconSize: [30, 38],
          iconAnchor: [15, 36],
          popupAnchor: [0, -34],
        }),
      })
        .bindPopup(this.popupHtml(store))
        .addTo(this.map!);

      marker.on('click', () => {
        this.selectedStore = store;
      });

      this.markers.set(store.id, marker);
    });
  }

  private popupHtml(store: StoreListItem): string {
    const rating = Math.round(Number(store.rating) || 0);
    const stars = Array.from({ length: 5 }, (_, index) =>
      `<span class="${index < rating ? 'filled' : ''}">&#9733;</span>`,
    ).join('');
    const verified = store.verified ? '<span class="verified-badge">Verificada</span>' : '';

    return `
      <div class="store-popup">
        <strong>${this.escapeHtml(store.name)}</strong>
        <p>${this.escapeHtml(store.address)}</p>
        <div class="popup-stars">${stars}</div>
        ${verified}
      </div>
    `;
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return entities[character];
    });
  }
}
