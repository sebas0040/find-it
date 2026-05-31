import { ProductListItem } from './product.model';
import { StoreListItem } from './store.model';

export interface Inventory {
  id: string | number;
  product: ProductListItem;
  store: StoreListItem;
  product_name?: string;
  store_name?: string;
  price: number;
  stock: number;
  available: boolean;
  created_at: string;
  updated_at?: string;
}
