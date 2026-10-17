"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types/store";

export interface CartItem {
  id: string; // Unique combination of product.id + variant.id
  productId: string;
  name: string;
  slug: string;
  image: string;
  variantLabel: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Charger depuis le localStorage au premier rendu
  useEffect(() => {
    try {
      const saved = localStorage.getItem("club_parfum_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignorer si localStorage n'est pas disponible
    }
  }, []);

  // Sauvegarder dans le localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem("club_parfum_cart", JSON.stringify(items));
    } catch {
      // Ignorer
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (product: Product, variant?: ProductVariant | null, quantity = 1) => {
    const variantId = variant?.id || "default";
    const variantLabel = variant?.size_label || "Format Standard";
    const price = variant?.price || product.base_price;
    const itemId = `${product.id}-${variantId}`;

    setItems((prev) => {
      const existing = prev.find((it) => it.id === itemId);
      if (existing) {
        return prev.map((it) =>
          it.id === itemId ? { ...it, quantity: it.quantity + quantity } : it
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          variantLabel,
          price,
          quantity,
        },
      ];
    });

    setIsOpen(true); // Ouvre le panier pour donner un retour visuel instantané
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity } : it))
    );
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
