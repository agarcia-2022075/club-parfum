"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [isAdded, setIsAdded] = useState(false);

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  const handleAddToCart = () => {
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <article className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#E7E2DA] transition-all duration-300 hover:shadow-xl hover:border-[#A16207]/40 relative">
      {/* Photographie du produit */}
      <div className="relative aspect-square overflow-hidden bg-[#F2EFE9]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          unoptimized
        />
        {/* Catégorie discrète sur papier crème */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase bg-[#FAFAF8]/95 backdrop-blur-sm text-[#1C1917] rounded-sm shadow-xs border border-[#E7E2DA]">
            {product.category_name}
          </span>
        </div>
      </div>

      {/* Détails du produit */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Notes olfactives (Pyramide olfactive visible) */}
          <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Notes olfactives">
            {product.scent_notes.map((note, idx) => (
              <span
                key={idx}
                className="text-[11px] text-[#57534E] bg-[#FAFAF8] border border-[#E7E2DA] px-2.5 py-0.5 rounded-sm font-normal tracking-wide"
              >
                {note}
              </span>
            ))}
          </div>

          {/* Nom du produit en Cormorant Garamond */}
          <h3 className="font-serif text-2xl font-normal text-[#1C1917] leading-tight group-hover:text-[#A16207] transition-colors">
            {product.name}
          </h3>

          {/* Description olfactive */}
          <p className="mt-2.5 text-xs text-[#57534E] line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Sélecteur de formats et Prix */}
        <div className="mt-6 pt-4 border-t border-[#F2EFE9]">
          {product.variants && product.variants.length > 1 && (
            <fieldset className="mb-4">
              <legend className="text-[10px] uppercase tracking-[0.2em] text-[#57534E] font-medium block mb-2">
                Sélectionner le format
              </legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`text-xs px-3 py-1.5 rounded-sm border transition-all duration-200 cursor-pointer min-h-[34px] ${
                        isSelected
                          ? "border-[#A16207] bg-[#A16207]/10 text-[#A16207] font-semibold"
                          : "border-[#E7E2DA] text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917]"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {v.size_label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#57534E] block">Prix TTC</span>
              <span className="font-serif text-2xl font-medium text-[#1C1917]">
                {formatPrice(currentPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`min-h-[44px] px-5 py-2.5 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-[#A16207] ${
                isAdded 
                  ? "bg-emerald-800 text-white" 
                  : "bg-[#1C1917] hover:bg-[#A16207] text-white active:scale-95 shadow-sm"
              }`}
              aria-label={`Ajouter ${product.name} au panier`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Ajouté</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
