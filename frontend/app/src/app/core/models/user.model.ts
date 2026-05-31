export type UserRole = 'CLIENT' | 'STORE' | 'ADMIN';

export interface User {
  id: string | number;
  email: string;
  name: string;
  phone: string;
  avatar: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
