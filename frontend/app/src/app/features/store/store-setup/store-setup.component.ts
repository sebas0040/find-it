import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { finalize } from 'rxjs';

import { StorePayload } from '../../../core/models';
import { StoreService } from '../../../core/services/store.service';

type StoreFormField = 'name' | 'description' | 'address' | 'latitude' | 'longitude';
type ServerErrors = Partial<Record<StoreFormField | 'detail' | 'non_field_errors', string>>;

@Component({
  selector: 'app-store-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './store-setup.component.html',
  styleUrl: './store-setup.component.scss',
})
export class StoreSetupComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly storeService = inject(StoreService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private viewReady = false;

  readonly storeForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    description: [''],
    address: ['', [Validators.required]],
    latitude: [null as number | null, [Validators.required]],
    longitude: [null as number | null, [Validators.required]],
  });

  isCheckingStore = true;
  isSaving = false;
  formReady = false;
  formError = '';
  serverErrors: ServerErrors = {};
  locationError = '';

  ngOnInit(): void {
    this.checkExistingStore();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.renderMapWhenReady();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  useCurrentLocation(): void {
    this.locationError = '';

    if (!navigator.geolocation) {
      this.locationError = 'Tu navegador no soporta geolocalizacion.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setLocation(position.coords.latitude, position.coords.longitude, true);
      },
      () => {
        this.locationError = 'No pudimos obtener tu ubicacion actual.';
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  }

  submit(): void {
    this.formError = '';
    this.serverErrors = {};

    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();

    if (!payload) {
      this.storeForm.controls.latitude.markAsTouched();
      this.storeForm.controls.longitude.markAsTouched();
      return;
    }

    this.isSaving = true;
    this.storeService
      .createStore(payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (store) => {
          this.storeService.setActiveStore(store);
          this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this.applyServerErrors(error, 'No pudimos crear tu tienda. Revisa los datos e intentalo otra vez.');
        },
      });
  }

  hasFieldError(fieldName: StoreFormField): boolean {
    const field = this.storeForm.controls[fieldName];
    return Boolean(this.serverErrors[fieldName]) || (field.invalid && (field.touched || field.dirty));
  }

  fieldMessage(fieldName: StoreFormField): string {
    if (this.serverErrors[fieldName]) {
      return this.serverErrors[fieldName]!;
    }

    if (fieldName === 'latitude' || fieldName === 'longitude') {
      return 'Selecciona una ubicacion en el mapa.';
    }

    return 'Este campo es requerido.';
  }

  private checkExistingStore(): void {
    this.storeService
      .getMyStore()
      .pipe(
        finalize(() => {
          this.isCheckingStore = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (store) => {
          this.storeService.setActiveStore(store);
          this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.formReady = true;
            this.isCheckingStore = false;
            this.changeDetectorRef.detectChanges();
            this.renderMapWhenReady();
            return;
          }

          this.formError = 'No pudimos verificar tu tienda. Intentalo de nuevo.';
        },
      });
  }

  private renderMapWhenReady(): void {
    if (!this.viewReady || !this.formReady || this.map) {
      return;
    }

    requestAnimationFrame(() => this.initMap());
  }

  private initMap(): void {
    if (this.map) {
      return;
    }

    const container = document.getElementById('store-setup-map');

    if (!container) {
      requestAnimationFrame(() => this.initMap());
      return;
    }

    const initialLat = 4.710989;
    const initialLng = -74.072092;
    this.map = L.map(container, {
      zoomControl: true,
      attributionControl: true,
    }).setView([initialLat, initialLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setLocation(event.latlng.lat, event.latlng.lng, false);
    });

    setTimeout(() => this.map?.invalidateSize());
  }

  private setLocation(latitude: number, longitude: number, centerMap: boolean): void {
    this.storeForm.patchValue({ latitude, longitude });
    this.storeForm.controls.latitude.markAsDirty();
    this.storeForm.controls.longitude.markAsDirty();

    if (!this.map) {
      return;
    }

    const latLng: L.LatLngExpression = [latitude, longitude];
    if (this.marker) {
      this.marker.setLatLng(latLng);
    } else {
      this.marker = L.marker(latLng, {
        draggable: true,
        icon: L.divIcon({
          className: 'store-location-marker',
          html: '<span></span>',
          iconSize: [32, 40],
          iconAnchor: [16, 38],
        }),
      }).addTo(this.map);

      this.marker.on('dragend', () => {
        const position = this.marker!.getLatLng();
        this.setLocation(position.lat, position.lng, false);
      });
    }

    if (centerMap) {
      this.map.setView(latLng, 16, { animate: true });
    }
  }

  private toPayload(): StorePayload | null {
    const value = this.storeForm.getRawValue();

    if (value.latitude === null || value.longitude === null) {
      return null;
    }

    return {
      name: value.name?.trim() || '',
      description: value.description?.trim() || '',
      address: value.address?.trim() || '',
      latitude: value.latitude,
      longitude: value.longitude,
    };
  }

  private applyServerErrors(error: unknown, fallback: string): void {
    if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || error.error === null) {
      this.formError = fallback;
      return;
    }

    this.serverErrors = this.normalizeErrors(error.error as Record<string, string | string[]>);
    this.formError = this.serverErrors.detail || this.serverErrors.non_field_errors || '';

    if (!this.formError && !Object.keys(this.serverErrors).length) {
      this.formError = fallback;
    }
  }

  private normalizeErrors(errors: Record<string, string | string[]>): ServerErrors {
    return Object.entries(errors).reduce<ServerErrors>((result, [key, value]) => {
      result[key as keyof ServerErrors] = Array.isArray(value) ? value.join(' ') : value;
      return result;
    }, {});
  }
}
