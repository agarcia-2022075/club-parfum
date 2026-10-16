export interface ProductVariant {
  id: string;
  sku: string;
  size_label: string; // e.g. "50 ml", "100 ml", "180 g"
  price: number;
  in_stock: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  scent_notes: string[];
  base_price: number;
  images: string[];
  is_active: boolean;
  featured?: boolean;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface ShippingMethod {
  id: string;
  code: "relay" | "colissimo" | "express";
  name: string;
  carrier: string;
  price: number;
  estimated_days: string;
  requires_relay_point: boolean;
  description: string;
}
