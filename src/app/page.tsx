import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/data/mock-data";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  // Sélectionner seulement 3 produits phares pour la page d'accueil (pour aérer et ne pas surcharger)
  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION ÉLÉGANTE ET AÉRÉE */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Colonne gauche */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block">
                Haute Parfumerie d'Intérieur
              </span>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-[#1C1917] font-normal leading-[1.08] tracking-tight">
                L'art d'embaumer votre quotidien.
              </h1>

              <p className="text-sm sm:text-base text-[#57534E] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Bougies végétales coulées avec patience, eaux de parfum et diffuseurs artisanaux élaborés pour enchanter vos espaces avec pureté et délicatesse.
              </p>

              {/* Actions principales vers la boutique dédiée */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/boutique"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-md bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-[#A16207]"
                >
                  <span>Explorer la Boutique</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>

                <a
                  href="https://wa.me/?text=Bonjour%20Club%20Parfum,%20j'aimerais%20des%20conseils%20sur%20vos%20senteurs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-md bg-white border border-[#E7E2DA] hover:border-[#1C1917] text-[#1C1917] text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Conseil personnalisé
                </a>
              </div>

              {/* Réassurance sous le CTA */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#57534E]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#A16207]" aria-hidden="true" />
                  <span>Cire 100% végétale sans OGM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#A16207]" aria-hidden="true" />
                  <span>Expédition rapide en France</span>
                </div>
              </div>
            </div>

            {/* Colonne droite : Photographie de mise en scène */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-[#E7E2DA]">
                <Image
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000"
                  alt="Bougie parfumée naturelle Club Parfum"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>

              {/* Étiquette d'artisanat */}
              <div className="absolute -bottom-6 -left-6 bg-[#FAFAF8] p-5 rounded-xl shadow-xl border border-[#E7E2DA] hidden sm:flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#F2EFE9] flex items-center justify-center text-[#A16207]">
                  <Sparkles className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">Parfums de Grasse</p>
                  <p className="text-[11px] text-[#57534E]">Concentrés de haute tenue & cire pure</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION SAVOIR-FAIRE ARTISANAL */}
        <section id="savoir-faire" className="py-20 bg-[#F2EFE9] border-y border-[#E7E2DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A16207] block">
                  01 • Matières Nobles
                </span>
                <h3 className="font-serif text-3xl text-[#1C1917] font-normal">
                  Cires végétales & pures
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
                  Nos bougies sont composées de cires végétales de soja et de colza garanties sans paraffine, associées à des mèches en coton non traité pour une brûle saine.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A16207] block">
                  02 • Création Olfactive
                </span>
                <h3 className="font-serif text-3xl text-[#1C1917] font-normal">
                  Senteurs de Grasse
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
                  Chaque parfum est développé avec des maîtres parfumeurs au cœur de Grasse. Des sillages intenses, sophistiqués et mémorables pour vos pièces de vie.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A16207] block">
                  03 • Fait avec Patience
                </span>
                <h3 className="font-serif text-3xl text-[#1C1917] font-normal">
                  Coulage artisanal
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
                  Chaque pièce est coulée à la main en petites séries en France. Cette attention au détail garantit une diffusion constante de la première à la dernière heure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SÉLECTION CURÉE DE 3 CRÉATIONS (AU LIEU D'UN CATALOGUE SURCHARGÉ) */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A16207] block mb-2">
                Les Incontournables
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
                Quelques Créations à Découvrir
              </h2>
            </div>

            <Link
              href="/boutique"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A16207] hover:text-[#1C1917] flex items-center gap-1.5 transition-colors group"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/boutique"
              className="inline-flex min-h-[48px] px-8 py-3.5 rounded-md bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 items-center justify-center gap-2 shadow-md"
            >
              <span>Accéder à toutes les collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* BANNIÈRE LIVRAISON FRANCE */}
        <section className="py-16 bg-[#F2EFE9]/60 border-t border-[#E7E2DA]">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h3 className="font-serif text-3xl text-[#1C1917]">Expédition sécurisée en France métropolitaine</h3>
            <p className="text-xs sm:text-sm text-[#57534E] max-w-xl mx-auto leading-relaxed font-light">
              Profitez du retrait pratique en Point Relais (Mondial Relay) dès 4,50 € ou d'une livraison soignée à domicile par Colissimo.
            </p>
            <div className="pt-2">
              <Link
                href="/livraison"
                className="text-xs font-semibold tracking-wider uppercase text-[#A16207] hover:underline"
              >
                Consulter les tarifs et délais de livraison →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
