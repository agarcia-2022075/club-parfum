"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8DFD8] transition-all duration-300 hover:shadow-lg hover:border-[#9C6D49]/40">
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-[#F2EBE3]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase bg-[#FAF8F5]/90 backdrop-blur-sm text-[#2A2421] rounded-full shadow-xs border border-[#E8DFD8]">
            {product.category_name}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Notas olfativas */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {product.scent_notes.map((note, idx) => (
              <span
                key={idx}
                className="text-[11px] text-[#70655E] bg-[#F2EBE3] px-2 py-0.5 rounded-md font-normal"
              >
                {note}
              </span>
            ))}
          </div>

          {/* Título */}
          <h3 className="font-serif text-lg font-normal text-[#2A2421] leading-snug group-hover:text-[#9C6D49] transition-colors">
            {product.name}
          </h3>

          {/* Descripción corta */}
          <p className="mt-2 text-xs text-[#70655E] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Variantes y Precio */}
        <div className="mt-6 pt-4 border-t border-[#F2EBE3]">
          {product.variants && product.variants.length > 1 && (
            <div className="mb-3">
              <label className="text-[10px] uppercase tracking-wider text-[#70655E] font-medium block mb-1">
                Format
              </label>
              <div className="flex gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      selectedVariant?.id === v.id
                        ? "border-[#9C6D49] bg-[#9C6D49]/10 text-[#9C6D49] font-medium"
                        : "border-[#E8DFD8] text-[#70655E] hover:border-[#9C6D49]/50"
                    }`}
                  >
                    {v.size_label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="text-xs text-[#70655E] block">Prix</span>
              <span className="font-serif text-lg font-semibold text-[#2A2421]">
                {formatPrice(currentPrice)}
              </span>
            </div>

            <button
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2A2421] hover:bg-[#9C6D49] text-white text-xs font-medium rounded-xl transition duration-200"
              onClick={() => alert(`Produit ajouté : ${product.name} (${selectedVariant?.size_label || "Standard"})`)}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
