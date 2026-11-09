export interface ProductVariant {
  id: string;
  sku: string;
  size_label: string; // e.g. "10 ml (Vapo de sac)", "50 ml", "100 ml", "180 g (45h)"
  price: number;
  in_stock: boolean;
}

export type OlfactoryFamily =
  | "Orientale"
  | "Boisée"
  | "Fleurie"
  | "Hespéridée"
  | "Aromatique"
  | "Gourmande"
  | "Poudrée"
  | (string & {});

export interface OlfactoryFamilyItem {
  id: string;
  name: string;
  mood: string;
  description?: string;
}

export interface OlfactoryPyramid {
  top_notes: string[];   // Notes de tête (première impression olfactive)
  heart_notes: string[]; // Notes de cœur (signature et âme de la fragrance)
  base_notes: string[];  // Notes de fond (sillage et tenue persistante)
}

export interface Product {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  scent_notes: string[];
  olfactory_family: OlfactoryFamily;
  facets: string; // e.g. "Ambré • Suave • Boisé"
  olfactory_pyramid: OlfactoryPyramid;
  concentration_info?: string; // e.g. "Eau de Parfum (18% de concentré de Grasse sur base d'alcool végétal)"
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

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const FREE_SHIPPING_THRESHOLD = 60; // 60,00 € pour la livraison offerte en France
