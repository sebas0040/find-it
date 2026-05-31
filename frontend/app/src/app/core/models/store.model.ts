export interface StoreLocation {
  latitude: number;
  longitude: number;
}

export interface Store {
  id: string | number;
  owner: string | number;
  owner_name: string;
  name: string;
  description: string;
  address: string;
  location: StoreLocation | null;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  rating: number | string;
  distance: number | { m: number; km: number } | null;
  created_at: string;
}

export interface StorePayload {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
}

export type StoreListItem = Pick<
  Store,
  'id' | 'name' | 'address' | 'location' | 'verified' | 'rating' | 'distance'
>;
