import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS, CATEGORIES, SHIPPING_METHODS } from "@/data/mock-data";
import { ArrowRight, Truck, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION ÉLÉGANTE (Taste-skill: pas de kickers superflus, typographie confiante en deux lignes max) */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-14 pb-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Colonne gauche : Titre et Argument */}
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

              {/* Actions principales */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="#collections"
                  className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-md bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-md focus-visible:ring-2 focus-visible:ring-[#A16207]"
                >
                  <span>Découvrir la collection</span>
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
                  <span>Livraison partout en France</span>
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
                  <p className="text-[11px] text-[#57534E]">Concentrés de haute tenue & combustion saine</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION SAVOIR-FAIRE (Taste-skill & Impeccable: le produit est la preuve) */}
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
                  Nos bougies sont composées de cires végétales de soja et de colza garanties sans paraffine, associées à des mèches en coton non traité pour une brûle propre et sans fumée noire.
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
                  Chaque parfum est développé avec des maîtres parfumeurs au cœur de la capitale mondiale du parfum. Des sillages intenses, sophistiqués et mémorables pour vos intérieurs.
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

        {/* CATALOGUE DES CRÉATIONS */}
        <section id="collections" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A16207] block mb-2">
              Le Catalogue
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
              Nos Créations Signatures
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
              Des fragrances élaborées pour créer des ambiances chaleureuses et réconfortantes dans chaque pièce.
            </p>
          </div>

          {/* Grille de Produits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* MODES DE LIVRAISON EN FRANCE */}
        <section id="livraison" className="py-20 bg-[#F2EFE9]/60 border-t border-[#E7E2DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A16207] block mb-2">
                Expédition Soignée
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
                Vos Modes de Livraison en France
              </h2>
              <p className="mt-2 text-xs text-[#57534E] font-light">
                Emballages protecteurs éco-conçus pour garantir une arrivée parfaite de vos créations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SHIPPING_METHODS.map((method) => (
                <div
                  key={method.id}
                  className="bg-white p-7 rounded-xl border border-[#E7E2DA] flex flex-col justify-between hover:border-[#A16207]/60 transition-all duration-300 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A16207]">
                        {method.carrier}
                      </span>
                      <span className="font-serif text-xl font-medium text-[#1C1917]">
                        {method.price.toFixed(2)} €
                      </span>
                    </div>
                    <h3 className="font-medium text-sm text-[#1C1917] mb-1.5">{method.name}</h3>
                    <p className="text-xs text-[#57534E] leading-relaxed mb-4 font-light">{method.description}</p>
                  </div>
                  <div className="pt-4 border-t border-[#F2EFE9] text-xs text-[#57534E] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#A16207]" aria-hidden="true" />
                    <span>Délai moyen constaté : {method.estimated_days}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION FAQ CONFORME AU BLUEPRINT TASTE-SKILL (Lecture continue en grille) */}
        <section id="faq" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#E7E2DA]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#A16207] block mb-2">
                Questions Fréquentes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal leading-tight">
                Tout ce que vous devez savoir.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
                Une interrogation sur nos temps de brûle ou un conseil pour choisir votre parfum d'ambiance ? Nous vous répondons en toute transparence.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-6 text-sm text-[#57534E] leading-relaxed">
              <div className="p-6 bg-white rounded-xl border border-[#E7E2DA]">
                <h4 className="font-medium text-[#1C1917] mb-1">Combien de temps brûle une bougie de 180 g ?</h4>
                <p className="font-light text-xs sm:text-sm">Une bougie de 180 g offre environ 45 heures de diffusion optimale. Pour profiter pleinement de son parfum, nous recommandons de la laisser brûler entre 2 et 3 heures lors de chaque utilisation afin que toute la surface devienne liquide.</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-[#E7E2DA]">
                <h4 className="font-medium text-[#1C1917] mb-1">Comment fonctionne la sélection du Point Relais ?</h4>
                <p className="font-light text-xs sm:text-sm">Lors de la validation de votre commande, une carte interactive vous permet de désigner le commerçant ou casier Mondial Relay le plus proche de votre domicile ou lieu de travail.</p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-[#E7E2DA]">
                <h4 className="font-medium text-[#1C1917] mb-1">Vos produits conviennent-ils aux personnes sensibles ?</h4>
                <p className="font-light text-xs sm:text-sm">Oui. Nous n'utilisons aucun dérivé pétrochimique et nos parfums répondent strictement aux normes IFRA (International Fragrance Association) européennes les plus rigoureuses.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
