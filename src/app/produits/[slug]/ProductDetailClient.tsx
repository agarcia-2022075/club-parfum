"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Check, MessageCircle, Heart, Share2, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const shareText = `Bonjour, j'aimerais avoir des conseils sur la création "${product.name}" (${selectedVariant?.size_label || ""}) de Club Parfum.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* Galerie Visuelle du Produit */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2EFE9] border border-[#E7E2DA] shadow-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
            priority
            unoptimized
          />
          <div className="absolute top-4 left-4">
            <span className="px-3.5 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase bg-[#FAFAF8]/95 backdrop-blur-sm text-[#1C1917] rounded-sm shadow-xs border border-[#E7E2DA]">
              {product.category_name}
            </span>
          </div>
        </div>
      </div>

      {/* Informations & Achat (Inspiré de BBW / Fetiche : ce qu'il sent + notes olfactives + formats) */}
      <div className="lg:col-span-6 space-y-8">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Création Artisanale
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal leading-tight">
            {product.name}
          </h1>
          
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917]">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-xs text-[#57534E]">TTC • Hors frais de port</span>
          </div>
        </div>

        {/* Pyramide Olfactive / Notes Sensationnelles */}
        <div className="p-5 rounded-xl bg-white border border-[#E7E2DA] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A16207]">
            <Sparkles className="w-4 h-4" />
            <span>Pyramide & Sillage Olfactif</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.scent_notes.map((note, idx) => (
              <span
                key={idx}
                className="text-xs text-[#1C1917] bg-[#FAFAF8] border border-[#E7E2DA] px-3 py-1 rounded-sm font-medium"
              >
                {note}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed pt-2 border-t border-[#F2EFE9] font-light">
            {product.description}
          </p>
        </div>

        {/* Sélecteur de format si variantes disponibles */}
        {product.variants && product.variants.length > 1 && (
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1C1917] block">
              Format & Contenance :
            </label>
            <div className="grid grid-cols-2 gap-3">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#A16207] bg-[#A16207]/10 ring-1 ring-[#A16207]"
                        : "border-[#E7E2DA] bg-white hover:border-[#1C1917]"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isSelected ? "text-[#A16207]" : "text-[#1C1917]"}`}>
                      {v.size_label}
                    </p>
                    <p className="text-xs text-[#57534E] mt-0.5 font-medium">{formatPrice(v.price)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantité & Bouton d'Ajout */}
        <div className="space-y-4 pt-2">
          <div className="flex gap-4">
            {/* Contrôle de Quantité */}
            <div className="flex items-center border border-[#E7E2DA] rounded-xl bg-white px-3 py-2 min-h-[48px]">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                aria-label="Diminuer la quantité"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-semibold text-[#1C1917]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>

            {/* Bouton Ajouter au Panier */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 min-h-[48px] px-8 py-3.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#A16207] shadow-md ${
                isAdded
                  ? "bg-emerald-800 text-white"
                  : "bg-[#1C1917] hover:bg-[#A16207] text-white active:scale-98"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Ajouté au Panier ({quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ajouter au Panier • {formatPrice(currentPrice * quantity)}</span>
                </>
              )}
            </button>
          </div>

          {/* Bouton Poser une Question WhatsApp sur cette fragrance */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-[#E7E2DA] bg-white hover:bg-[#F2EFE9] text-[#1C1917] text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <MessageCircle className="w-4 h-4 text-[#A16207]" />
            <span>Demander un avis sur cette senteur sur WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
