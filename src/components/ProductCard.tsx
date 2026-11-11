"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/store";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.is_active === false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const defaultVariant =
      product.variants && product.variants.length > 0 ? product.variants[0] : null;
    addItem(product, defaultVariant, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  return (
    <article className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#E7E2DA] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_14px_34px_-12px_rgba(28,25,23,0.1)] hover:border-[#A16207]/40 relative">
      {/* Lien vers la fiche produit */}
      <Link
        href={`/produits/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-[#F2EFE9] cursor-pointer"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out ${
            isOutOfStock ? "grayscale-30 opacity-80" : ""
          }`}
        />

        {/* Badge catégorie lisible en haut à gauche */}
        <div className="absolute top-3.5 left-3.5">
          <span className="bg-[#FAFAF8]/95 backdrop-blur-xs text-[#1C1917] text-xs tracking-[0.16em] uppercase px-3 py-1.5 font-medium border border-[#E7E2DA]">
            {product.category_name}
          </span>
        </div>

        {/* Badge Épuisé */}
        {isOutOfStock && (
          <div className="absolute top-3.5 right-3.5">
            <span className="px-3 py-1.5 text-xs font-medium tracking-[0.16em] uppercase bg-[#1C1917] text-[#FAFAF8]">
              Épuisé
            </span>
          </div>
        )}
      </Link>

      {/* Contenu éditorial de la carte */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-white">
        <div className="space-y-2">
          {/* Famille olfactive */}
          <p className="text-xs uppercase tracking-[0.2em] text-[#92400E] font-medium">
            {product.olfactory_family
              ? `Famille ${product.olfactory_family}${product.facets ? ` • ${product.facets.split("•")[0].trim()}` : ""}`
              : product.facets || "Haute Parfumerie de Grasse"}
          </p>

          {/* Titre avec lien */}
          <Link href={`/produits/${product.slug}`} className="block cursor-pointer">
            <h3 className="font-serif text-2xl sm:text-[26px] leading-snug text-[#1C1917] group-hover:text-[#A16207] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Les 3 notes olfactives en text-sm (14px) */}
          {product.scent_notes && product.scent_notes.length > 0 && (
            <p
              className="text-sm text-[#44403C] tracking-normal pt-1 leading-relaxed"
              aria-label="Notes olfactives"
            >
              {product.scent_notes.slice(0, 3).join(" • ")}
            </p>
          )}
        </div>

        {/* Prix et Action Rapide */}
        <div className="mt-6 pt-4 border-t border-[#F2EFE9] flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase tracking-[0.14em] text-[#57534E] block">
              {product.variants && product.variants.length > 1 ? "À partir de" : "Prix"}
            </span>
            <span className="font-serif text-2xl sm:text-[26px] font-semibold text-[#1C1917] leading-snug">
              {formatPrice(product.base_price)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/produits/${product.slug}`}
              className="px-4 py-2.5 border border-[#E7E2DA] hover:border-[#1C1917] text-[#1C1917] text-xs font-medium tracking-[0.14em] uppercase transition-colors cursor-pointer"
              title="Choisir le format et découvrir la pyramide olfactive"
            >
              Options
            </Link>

            {!isOutOfStock ? (
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`min-h-[42px] px-4 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                  isAdded
                    ? "bg-[#44403C] text-[#FAFAF8]"
                    : "bg-[#1C1917] hover:bg-[#A16207] text-[#FAFAF8]"
                }`}
                title="Ajouter au panier"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Ajouté</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ajouter</span>
                  </>
                )}
              </button>
            ) : (
              <Link
                href={`/produits/${product.slug}`}
                className="px-4 py-2.5 bg-[#F2EFE9] text-[#57534E] text-xs font-medium tracking-[0.14em] uppercase cursor-pointer"
              >
                Indisponible
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
