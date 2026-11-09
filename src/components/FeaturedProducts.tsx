"use client";

import { useState, useMemo } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { ProductCard } from "@/components/ProductCard";

type TabFilter = "featured" | "cat-2" | "cat-1" | "cat-3";

const TABS: { id: TabFilter; label: string }[] = [
  { id: "featured", label: "Sélection Étoile" },
  { id: "cat-2", label: "Eaux de Parfum" },
  { id: "cat-1", label: "Bougies Végétales" },
  { id: "cat-3", label: "Diffuseurs & Brumes" },
];

export function FeaturedProducts() {
  const { products } = useCatalog();
  const [activeTab, setActiveTab] = useState<TabFilter>("featured");

  const displayProducts = useMemo(() => {
    const activeList = products.filter((p) => p.is_active !== false);

    if (activeTab === "featured") {
      const featured = activeList.filter((p) => p.featured);
      const rest = activeList.filter((p) => !p.featured);
      return [...featured, ...rest].slice(0, 6);
    }

    return activeList.filter((p) => p.category_id === activeTab).slice(0, 6);
  }, [products, activeTab]);

  return (
    <div className="space-y-10">
      {/* Onglets de filtrage instantané style monparfum.net */}
      <div
        role="tablist"
        aria-label="Filtrer les créations par univers"
        className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b border-[#E7E2DA] pb-6"
      >
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs uppercase tracking-[0.18em] font-medium transition-all duration-300 cursor-pointer border ${
                isSelected
                  ? "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917]"
                  : "bg-white text-[#44403C] border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grille de créations avec transition fluide */}
      <div
        key={activeTab}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 reveal-up"
      >
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
