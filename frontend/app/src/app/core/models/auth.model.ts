import { User } from './user.model';
import { UserRole } from './user.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
  phone?: string;
  role: Extract<UserRole, 'CLIENT' | 'STORE'>;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}
