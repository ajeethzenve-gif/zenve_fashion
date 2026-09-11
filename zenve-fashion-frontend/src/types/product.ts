export type ProductCategory = 'people' | 'pets' | 'twin';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  category: ProductCategory;
  collection: string;
  collectionSlug?: string;
  price: number;
  originalPrice: number;
  discount: number; // percentage (e.g. 20 for 20%)
  rating: number;
  reviewCount: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  designer?: string;
  occasion?: string;
  badge?: 'NEW' | 'BESTSELLER' | 'TWIN EDIT' | 'LIMITED ATELIER';
  sku: string;
  material: string;
  careInstructions: string;
  featured?: boolean;
  atelierPick?: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category: ProductCategory | 'all';
  itemCount?: number;
}

export type SortOption = 
  | 'featured' 
  | 'newest' 
  | 'price-low' 
  | 'price-high' 
  | 'price-asc' 
  | 'price-desc' 
  | 'rating';

export interface ProductFilterState {
  category?: ProductCategory | 'all';
  audience?: ProductCategory | 'all';
  occasion?: string;
  collection?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes: string[];
  colors: string[];
  badges: string[];
  inStockOnly?: boolean;
  searchQuery?: string;
  sort: SortOption;
}
