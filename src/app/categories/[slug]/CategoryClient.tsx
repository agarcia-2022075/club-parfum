"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import { ProductCard } from "@/components/ProductCard";
import { CategoryPageConfig, CATEGORY_PAGES } from "@/data/mock-data";
import { ArrowRight, Sparkles } from "lucide-react";

interface CategoryClientProps {
  config: CategoryPageConfig;
}

export function CategoryClient({ config }: CategoryClientProps) {
  const { products } = useCatalog();

  // Filtrer les créations selon la règle de la catégorie
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (config.filterType === "category") {
        if (Array.isArray(config.filterValue)) {
          return config.filterValue.includes(product.category_id);
        }
        return product.category_id === config.filterValue;
      }

      if (config.filterType === "family") {
        if (Array.isArray(config.filterValue)) {
          return config.filterValue.includes(product.olfactory_family);
        }
        return product.olfactory_family === config.filterValue;
      }

      if (config.filterType === "discovery") {
        return (
          product.variants &&
          product.variants.some((v) =>
            v.size_label.toLowerCase().includes("10 ml")
          )
        );
      }

      if (config.filterType === "collection-privee") {
        return (
          product.category_id === "cat-2" ||
          product.name.toLowerCase().includes("privée") ||
          product.name.toLowerCase().includes("suprême")
        );
      }

      if (config.filterType === "search") {
        const query = String(config.filterValue || "").toLowerCase();
        return (
          product.slug.toLowerCase().includes(query) ||
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [products, config]);

  // Récupérer les catégories sœurs selon le groupe (Parfums ou Maison)
  const siblingPages = useMemo(() => {
    return Object.values(CATEGORY_PAGES).filter(
      (p) => p.group === config.group
    );
  }, [config.group]);

  return (
    <div className="space-y-12">
      {/* Navigation rapide entre catégories sœurs (Píldoras limpias) */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b border-[#E7E2DA] pb-6">
        {siblingPages.map((sibling) => {
          const isActive = sibling.slug === config.slug;
          return (
            <Link
              key={sibling.slug}
              href={`/categories/${sibling.slug}`}
              className={`px-4 sm:px-5 py-2.5 text-[14px] sm:text-[15px] font-normal transition-all duration-200 border rounded-full ${
                isActive
                  ? "bg-[#1C1917] text-[#FAFAF8] border-[#1C1917] shadow-xs"
                  : "bg-white text-[#44403C] border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
              }`}
            >
              {sibling.title.split(",")[0].trim()}
            </Link>
          );
        })}
      </div>

      {/* Barre de statut */}
      <div className="flex items-center justify-between text-sm sm:text-[15px] text-[#44403C] border-b border-[#E7E2DA] pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A16207]" />
          <span>
            <strong className="text-[#1C1917] font-semibold">
              {filteredProducts.length}
            </strong>{" "}
            {filteredProducts.length > 1
              ? "créations disponibles"
              : "création disponible"}
          </span>
        </div>

        <Link
          href="/boutique"
          className="text-xs sm:text-sm font-medium text-[#A16207] hover:text-[#1C1917] uppercase tracking-[0.14em] flex items-center gap-1 transition-colors"
        >
          <span>Voir tout le catalogue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grille de produits */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#E7E2DA] p-10 max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-2xl text-[#1C1917]">
            Créations en cours d&apos;élaboration
          </h3>
          <p className="text-sm text-[#44403C] leading-relaxed">
            Nos maîtres parfumeurs préparent de nouvelles formulations à Grasse.
            En attendant, explorez notre boutique générale.
          </p>
          <div className="pt-2">
            <Link
              href="/boutique"
              className="inline-flex min-h-[44px] px-6 py-2.5 bg-[#1C1917] hover:bg-[#A16207] text-white text-xs uppercase tracking-[0.16em] font-semibold transition"
            >
              Découvrir la Boutique
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
