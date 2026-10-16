"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/mock-data";
import Link from "next/link";

export default function BoutiquePage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts = activeCategory === "all"
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter((p) => p.category_id === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* En-tête de la Boutique */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Catalogue Complet
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal tracking-tight">
            Toutes Nos Créations
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
            Découvrez nos bougies naturelles, nos eaux de parfum et nos diffuseurs d'ambiance formulés avec des essences nobles de Grasse.
          </p>
        </div>

        {/* Filtres par Catégorie (Boutons tactiles élégants) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "bg-white text-[#57534E] border border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
            }`}
          >
            Tous les produits ({MOCK_PRODUCTS.length})
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#1C1917] text-white shadow-xs"
                  : "bg-white text-[#57534E] border border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grille des Produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-[#57534E]">Aucun produit trouvé dans cette catégorie.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
