import { ProductListItem } from './product.model';
import { User } from './user.model';

export interface Review {
  id: string | number;
  store?: string | number;
  store_id?: string | number;
  store_name?: string;
  user?: string | number | Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  user_id?: string | number;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface Favorite {
  id: string | number;
  product?: ProductListItem;
  product_id?: string | number;
  product_name?: string;
  created_at: string;
}
