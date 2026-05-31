import { Injectable, signal } from '@angular/core';

export interface UserLocation {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly currentLocation = signal<UserLocation | null>(null);

  setLocation(location: UserLocation): void {
    this.currentLocation.set(location);
  }

  clearLocation(): void {
    this.currentLocation.set(null);
  }
}
