import { Suspense } from "react";
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BoutiqueClient } from "./BoutiqueClient";

export const metadata: Metadata = {
  title: "La Boutique | Eaux de Parfum, Bougies Artisanales & Diffuseurs de Grasse",
  description:
    "Explorez notre collection complète de créations parfumées : eaux de parfum concentrées, bougies 100% cire végétale, brumes textiles et diffuseurs. Livraison offerte dès 60 € d'achat.",
  openGraph: {
    title: "La Boutique • Haute Parfumerie & Bougies Artisanales | Club Parfum",
    description:
      "Explorez nos fragrances nobles élaborées à Grasse avec des cires végétales et des essences intenses. Livraison offerte dès 60 €.",
  },
};

export default function BoutiquePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* En-tête de la Boutique */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A16207] font-semibold block mb-2">
            Haute Parfumerie & Bougies
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal tracking-tight">
            Toutes Nos Créations
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed font-normal">
            Découvrez nos bougies 100% végétales, nos eaux de parfum concentrées et nos diffuseurs d&apos;ambiance formulés avec des essences nobles de Grasse.
          </p>
        </div>

        {/* Composant interactif Client avec recherche, filtres et synchronisation admin enveloppé dans Suspense */}
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="inline-block w-8 h-8 border-2 border-[#A16207] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xs uppercase tracking-[0.2em] text-[#57534E]">
                Chargement de la collection...
              </p>
            </div>
          }
        >
          <BoutiqueClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
