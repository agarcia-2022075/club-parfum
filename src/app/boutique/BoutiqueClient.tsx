"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { useCatalog } from "@/context/CatalogContext";
import { OlfactoryFamily } from "@/types/store";
import { getOlfactoryTheme } from "@/lib/olfactory-theme";
import { Search, RotateCcw, Sparkles, X } from "lucide-react";

export function BoutiqueClient() {
  const searchParams = useSearchParams();
  const { products, categories, olfactoryFamilies } = useCatalog();

  const urlCategory = searchParams.get("category");
  const urlFamily = searchParams.get("family");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(urlCategory || "all");
  const [activeFamily, setActiveFamily] = useState<"all" | OlfactoryFamily>(
    (urlFamily as OlfactoryFamily) || "all"
  );

  const familyFilterItems = useMemo(() => {
    return [
      { id: "all", label: "Toutes les familles" },
      ...olfactoryFamilies.map((f) => ({ id: f.name, label: f.name })),
    ];
  }, [olfactoryFamilies]);

  // Mettre à jour si l'URL change (ex: clic sur un univers depuis la navbar)
  useEffect(() => {
    if (urlCategory) setActiveCategory(urlCategory);
    if (urlFamily) setActiveFamily(urlFamily as OlfactoryFamily);
  }, [urlCategory, urlFamily]);

  // Filtrage combiné réactif : Recherche texte + Catégorie + Famille Olfactive
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtre catégorie
      if (activeCategory !== "all" && product.category_id !== activeCategory) {
        return false;
      }

      // Filtre famille olfactive
      if (activeFamily !== "all" && product.olfactory_family !== activeFamily) {
        return false;
      }

      // Filtre recherche textuelle
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchFacets = product.facets?.toLowerCase().includes(query);
        const matchFamily = product.olfactory_family?.toLowerCase().includes(query);
        const matchNotes = product.scent_notes.some((note) =>
          note.toLowerCase().includes(query)
        );
        const matchPyramid = product.olfactory_pyramid
          ? [
              ...product.olfactory_pyramid.top_notes,
              ...product.olfactory_pyramid.heart_notes,
              ...product.olfactory_pyramid.base_notes,
            ].some((n) => n.toLowerCase().includes(query))
          : false;

        if (!matchName && !matchDesc && !matchFacets && !matchFamily && !matchNotes && !matchPyramid) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeCategory, activeFamily, searchQuery]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setActiveFamily("all");
  };

  const hasActiveFilters = searchQuery !== "" || activeCategory !== "all" || activeFamily !== "all";

  return (
    <div className="space-y-10">
      {/* Barre de Recherche Élégante & Rapide */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, note (vanille, rose, cèdre...) ou sillage..."
            className="w-full pl-12 pr-10 py-3.5 bg-white border border-[#E7E2DA] focus:border-[#A16207] rounded-2xl text-base text-[#1C1917] placeholder:text-[#57534E]/60 focus:outline-none transition shadow-2xs"
          />
          <Search className="w-5 h-5 text-[#A16207] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#57534E] hover:text-[#1C1917] p-1 cursor-pointer flex items-center justify-center"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Double niveau de filtres : 1. Catégories, 2. Familles Olfactives */}
      <div className="space-y-5">
        {/* Filtre 1 : Catégories principales */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#1C1917] text-white shadow-xs"
                : "bg-white text-[#44403C] border border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
            }`}
          >
            Toutes les créations ({products.length})
          </button>

          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#1C1917] text-white shadow-xs"
                    : "bg-white text-[#44403C] border border-[#E7E2DA] hover:border-[#1C1917] hover:text-[#1C1917]"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Filtre 2 : Famille Olfactive avec Teintes Sensorielles */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-sm uppercase tracking-wider text-[#A16207] font-semibold mr-1 hidden sm:inline">
            Famille :
          </span>
          {familyFilterItems.map((fam) => {
            const isSelected = activeFamily === fam.id;
            const theme = fam.id !== "all" ? getOlfactoryTheme(fam.id) : null;

            return (
              <button
                key={fam.id}
                type="button"
                onClick={() => setActiveFamily(fam.id)}
                className={`px-4 py-2 rounded-xl text-[13px] sm:text-sm font-medium tracking-wide transition-all duration-150 cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? fam.id === "all"
                      ? "bg-[#1C1917] text-white border-[#1C1917] shadow-xs"
                      : `${theme?.activeFilterClass} shadow-xs`
                    : fam.id === "all"
                    ? "bg-[#F2EFE9] text-[#44403C] border-[#E7E2DA] hover:bg-[#E7E2DA]"
                    : `${theme?.bg} ${theme?.text} ${theme?.border} hover:shadow-xs`
                }`}
              >
                {theme && <span className={`w-2 h-2 rounded-full ${theme.dot}`} />}
                <span>{fam.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre de statut et réinitialisation */}
      <div className="flex items-center justify-between border-b border-[#E7E2DA] pb-4 text-sm sm:text-[15px] text-[#44403C]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A16207]" />
          <span>
            <strong className="text-[#1C1917] font-semibold">{filteredProducts.length}</strong>{" "}
            {filteredProducts.length > 1 ? "créations disponibles" : "création disponible"}
          </span>
          {searchQuery && (
            <span className="text-sm text-[#A16207]">
              pour &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A16207] hover:text-[#1C1917] transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser les filtres</span>
          </button>
        )}
      </div>

      {/* Grille des Produits */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E7E2DA] p-8 space-y-4 max-w-lg mx-auto shadow-xs">
          <p className="font-serif text-2xl sm:text-3xl text-[#1C1917]">Aucune fragrance ne correspond à cette sélection</p>
          <p className="text-base text-[#44403C] leading-relaxed">
            Modifiez votre terme de recherche ou réinitialisez les filtres pour explorer l&apos;ensemble de nos créations artisanales.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#A16207] transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Afficher tout le catalogue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
