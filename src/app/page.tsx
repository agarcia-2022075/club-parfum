import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS, SHIPPING_METHODS } from "@/data/mock-data";
import { ArrowRight, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION ÉPURÉE & AÉRÉE (Grand espace de respiration) */}
        <section className="relative px-6 sm:px-8 lg:px-12 pt-20 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            
            {/* Colonne gauche : Typographie calme et affirmative */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <span className="text-xs uppercase tracking-[0.35em] text-[#A16207] font-semibold block">
                Maison de Senteurs • France
              </span>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[#1C1917] font-light leading-[1.08] tracking-tight">
                L'art d'embaumer votre intérieur.
              </h1>

              <p className="text-base sm:text-lg text-[#57534E] max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                Bougies végétales coulées à la main et parfums délicats conçus pour transformer votre foyer en un cocon chaleureux.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                <Link
                  href="#collections"
                  className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-sm bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-sm"
                >
                  <span>Découvrir la collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>

                <a
                  href="https://wa.me/?text=Bonjour%20Club%20Parfum,%20j'aimerais%20un%20conseil%20personnalis%C3%A9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-sm border border-[#E7E2DA] hover:border-[#1C1917] text-[#1C1917] text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  Conseil olfactif
                </a>
              </div>
            </div>

            {/* Colonne droite : Photographie pleine et pure (sans éléments parasites par-dessus) */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-[#E7E2DA]/80">
                <Image
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000"
                  alt="Bougie artisanale Club Parfum"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        </section>

        {/* CATALOGUE DIRECT (Le visiteur voit les produits immédiatement sans distraction) */}
        <section id="collections" className="py-28 bg-white border-y border-[#E7E2DA]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A16207] block mb-2">
                  La Sélection
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-light">
                  Nos Créations
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#57534E] max-w-sm font-light leading-relaxed">
                Cires 100% végétales sans paraffine et fragrances sélectionnées de Grasse.
              </p>
            </div>

            {/* Grille aérée avec espacement généreux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* PAUSE ÉDITORIALE / SAVOIR-FAIRE (Respiration visuelle chaleureuse) */}
        <section className="py-32 bg-[#F2EFE9] text-center px-6 sm:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-xs uppercase tracking-[0.35em] text-[#A16207] font-semibold block">
              Engagement & Qualité
            </span>
            <p className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-light leading-snug">
              « Chaque bougie est coulée à la main pour illuminer vos moments de quiétude. »
            </p>
            <p className="text-xs sm:text-sm text-[#57534E] font-light tracking-wide max-w-lg mx-auto">
              Cire végétale de colza et soja • Mèches en pur coton • Formules saines
            </p>
          </div>
        </section>

        {/* MODES DE LIVRAISON DISCRETS ET CLAIRS */}
        <section id="livraison" className="py-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-md mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A16207] block mb-2">
              Livraison en France
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-light">
              Expédition Simple & Sécurisée
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SHIPPING_METHODS.map((method) => (
              <div
                key={method.id}
                className="p-8 rounded-xl bg-white border border-[#E7E2DA] flex flex-col justify-between hover:border-[#A16207]/40 transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A16207]">
                      {method.carrier}
                    </span>
                    <span className="font-serif text-2xl font-light text-[#1C1917]">
                      {method.price.toFixed(2)} €
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-[#1C1917] mb-2">{method.name}</h3>
                  <p className="text-xs text-[#57534E] leading-relaxed font-light mb-6">{method.description}</p>
                </div>
                <div className="pt-4 border-t border-[#F2EFE9] text-xs text-[#57534E] flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#A16207]" aria-hidden="true" />
                  <span>{method.estimated_days}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
