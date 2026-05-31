import { Category } from './category.model';

export interface Product {
  id: string | number;
  name: string;
  brand: string;
  description: string;
  image: string;
  category: Category;
  created_at: string;
}

export interface ProductListItem {
  id: string | number;
  name: string;
  brand: string;
  image?: string;
  category: Category | string | number;
  created_at?: string;
}
