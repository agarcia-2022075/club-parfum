import dynamic from "next/dynamic";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import {
  ArrowRight,
  Sparkles,
  Droplets,
  Flame,
  Award,
  Truck,
  ShieldCheck,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HomeFaqAccordion = dynamic(
  () => import("@/components/HomeFaqAccordion").then((mod) => mod.HomeFaqAccordion),
  { ssr: true }
);

const OlfactoryQuiz = dynamic(
  () => import("@/components/OlfactoryQuiz").then((mod) => mod.OlfactoryQuiz)
);

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* SECCIÓN 1: HERO EDITORIAL INMERSIVO                        */}
        {/* ========================================================= */}
        <section className="relative bg-[#F5F2EB]/60 border-b border-[#E7E2DA] pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Colonne gauche : Titre & Proposition éditoriale */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Badge éditorial authentique */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E7E2DA] text-xs font-semibold tracking-[0.22em] text-[#A16207] uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-[#A16207]" aria-hidden="true" />
                  <span>Artisan Parfumeur • Maison de Senteurs • Essences Nobles de Grasse</span>
                </div>

                <div className="space-y-3">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-[60px] text-[#1C1917] font-normal leading-[1.15] tracking-tight">
                    Votre signature parfumée, l&apos;âme de votre maison.
                  </h1>
                </div>

                <p className="text-base sm:text-lg text-[#44403C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Des créations parfumées artisanales élaborées avec les essences nobles de Grasse : Eaux de Parfum haute concentration (15% à 20%), bougies 100% cire végétale et diffuseurs d&apos;intérieur.
                </p>

                {/* Double CTA de haut contraste */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href="/boutique"
                    className="w-full sm:w-auto min-h-[52px] px-8 py-4 rounded-none sm:rounded-md bg-[#1C1917] hover:bg-[#A16207] text-white text-xs sm:text-[13px] uppercase tracking-[0.18em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-md"
                  >
                    <span>Découvrir nos Parfums</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>

                  <a
                    href="#diagnostic-olfactif"
                    className="w-full sm:w-auto min-h-[52px] px-7 py-4 rounded-none sm:rounded-md bg-white border border-[#1C1917]/20 hover:border-[#1C1917] text-[#1C1917] text-xs sm:text-[13px] uppercase tracking-[0.16em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-[#A16207]" />
                    <span>Trouver mon Sillage (30s)</span>
                  </a>
                </div>

                {/* Micro-piliers de sérénité */}
                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs sm:text-sm text-[#44403C]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A16207]" />
                    <span>Concentration 15% à 20%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A16207]" />
                    <span>Cires végétales de soja & colza</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A16207]" />
                    <span>Livraison offerte dès 60 €</span>
                  </span>
                </div>
              </div>

              {/* Colonne droite : Composition visuelle éditoriale verticale */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-md bg-white p-3 border border-[#E7E2DA] shadow-xl">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F2EFE9]">
                    <Image
                      src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000"
                      alt="Création parfumée artisanale Club Parfum Grasse"
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Carte inférieure intégrée */}
                  <div className="pt-3.5 pb-1 px-2 text-center border-t border-[#E7E2DA] mt-3">
                    <p className="text-xs sm:text-[13px] uppercase tracking-[0.16em] text-[#1C1917] font-semibold">
                      Format Découverte 10 ml dès 9,90 €
                    </p>
                    <p className="text-xs text-[#57534E] mt-0.5 font-light">
                      Testez sur peau sans risque avant de choisir votre grand flacon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECCIÓN 2: BANDA DE 4 PILARES DE REASSURANCE               */}
        {/* ========================================================= */}
        <section
          aria-label="Engagements de la Maison"
          className="bg-white border-b border-[#E7E2DA] py-8"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">Nos Engagements d&apos;Excellence</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pilier 1 */}
              <div className="flex items-start gap-3.5 p-3">
                <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] shrink-0">
                  <Award className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-[#1C1917]">
                    Fabrication 100% Française
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 font-light">
                    Essences de Grasse & coulage artisanal
                  </p>
                </div>
              </div>

              {/* Pilier 2 */}
              <div className="flex items-start gap-3.5 p-3">
                <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] shrink-0">
                  <Truck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-[#1C1917]">
                    Livraison Offerte dès 60 €
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 font-light">
                    En Point Relais Mondial Relay & Colissimo
                  </p>
                </div>
              </div>

              {/* Pilier 3 */}
              <div className="flex items-start gap-3.5 p-3">
                <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-[#1C1917]">
                    Expédition Rapide 48h/72h
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 font-light">
                    Emballage anti-casse haute protection
                  </p>
                </div>
              </div>

              {/* Pilier 4 */}
              <div className="flex items-start gap-3.5 p-3">
                <div className="w-11 h-11 rounded-full bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-[15px] font-semibold text-[#1C1917]">
                    Commandes Garanties
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 font-light">
                    Préparation artisanale soignée &amp; emballage haute protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECCIÓN 3: LES INCONTOURNABLES DE LA MAISON                */}
        {/* ========================================================= */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-[#A16207] block mb-2">
                Haute Parfumerie & Cires Nobles
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight leading-[1.18]">
                Les Incontournables de la Maison
              </h2>
            </div>

            <Link
              href="/boutique"
              className="text-xs sm:text-sm font-medium uppercase tracking-[0.16em] text-[#A16207] hover:text-[#1C1917] flex items-center gap-1.5 transition-colors group"
            >
              <span>Accéder à toute la collection</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Grille dynamique avec onglets instantanés */}
          <FeaturedProducts />

          <div className="mt-14 text-center">
            <Link
              href="/boutique"
              className="inline-flex min-h-[48px] px-8 py-3.5 bg-[#1C1917] hover:bg-[#A16207] text-white text-xs sm:text-[13px] font-semibold uppercase tracking-[0.16em] transition-all duration-300 items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECCIÓN 4: EXPLOREZ NOS CATÉGORIES & L'HÉRITAGE DE GRASSE  */}
        {/* ========================================================= */}
        <section className="py-20 bg-white border-y border-[#E7E2DA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            {/* 1. Les 3 Grandes Catégories Visuelles reliées aux pages dédiées */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
                <span className="text-xs sm:text-sm uppercase tracking-[0.24em] text-[#A16207] font-semibold block">
                  Univers Olfactifs
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight leading-[1.18]">
                  Explorez nos Catégories
                </h2>
                <p className="text-sm sm:text-base text-[#57534E] font-light leading-relaxed">
                  Du sillage intime sur peau aux ambiances délicates pour chaque pièce de votre maison.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Catégorie 1 : Eaux de Parfum */}
                <Link
                  href="/categories/eaux-de-parfum"
                  className="group relative aspect-[4/5] overflow-hidden border border-[#E7E2DA] flex flex-col justify-end p-7 sm:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#A16207]"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"
                    alt="Eaux de Parfum de Grasse"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/40 to-transparent transition-opacity" />

                  <div className="relative z-10 space-y-2.5 text-white">
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#F5F2EB] font-medium block">
                      Concentration 15% à 20%
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug">
                      Eaux de Parfum
                    </h3>
                    <p className="text-sm sm:text-[15px] text-[#E7E2DA]/95 font-light leading-relaxed line-clamp-2">
                      Sillages nobles macérés dans un alcool végétal pur. Formats 10 ml, 50 ml et 100 ml.
                    </p>
                    <span className="inline-flex items-center gap-1.5 pt-2 text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold text-[#FAFAF8] group-hover:text-[#F5F2EB]">
                      <span>Découvrir</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>

                {/* Catégorie 2 : Bougies Parfumées Végétales */}
                <Link
                  href="/categories/bougies-parfumees"
                  className="group relative aspect-[4/5] overflow-hidden border border-[#E7E2DA] flex flex-col justify-end p-7 sm:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#A16207]"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800"
                    alt="Bougies Végétales Artisanales"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/40 to-transparent transition-opacity" />

                  <div className="relative z-10 space-y-2.5 text-white">
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#F5F2EB] font-medium block">
                      Cire 100% Végétale
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug">
                      Bougies Parfumées
                    </h3>
                    <p className="text-sm sm:text-[15px] text-[#E7E2DA]/95 font-light leading-relaxed line-clamp-2">
                      Soja & colza sans paraffine avec mèches en pur coton pour plus de 45h de diffusion saine.
                    </p>
                    <span className="inline-flex items-center gap-1.5 pt-2 text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold text-[#FAFAF8] group-hover:text-[#F5F2EB]">
                      <span>Découvrir</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>

                {/* Catégorie 3 : Maison & Brumes */}
                <Link
                  href="/categories/maison"
                  className="group relative aspect-[4/5] overflow-hidden border border-[#E7E2DA] flex flex-col justify-end p-7 sm:p-8 transition-all duration-500 hover:shadow-xl hover:border-[#A16207]"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800"
                    alt="Diffuseurs et Brumes d'Intérieur"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/90 via-[#1C1917]/40 to-transparent transition-opacity" />

                  <div className="relative z-10 space-y-2.5 text-white">
                    <span className="text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#F5F2EB] font-medium block">
                      Ambiance Continue
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal leading-snug">
                      Maison & Brumes
                    </h3>
                    <p className="text-sm sm:text-[15px] text-[#E7E2DA]/95 font-light leading-relaxed line-clamp-2">
                      Bâtonnets de rotin naturel et brumes d&apos;oreiller pour un réconfort quotidien apaisant.
                    </p>
                    <span className="inline-flex items-center gap-1.5 pt-2 text-xs sm:text-sm uppercase tracking-[0.16em] font-semibold text-[#FAFAF8] group-hover:text-[#F5F2EB]">
                      <span>Découvrir</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* 2. Bloque Éditorial "L'Art de la Parfumerie à Grasse — Notre Savoir-Faire" */}
            <div className="bg-[#1C1917] text-[#FAFAF8] p-8 sm:p-12 lg:p-16 rounded-2xl border border-[#44403C]">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-[#D4A359] block">
                      Savoir-Faire & Noblesse des Matières
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-[1.18]">
                      L&apos;Art de la Parfumerie à Grasse
                    </h2>
                  </div>

                  <p className="text-base sm:text-lg text-[#D6D3D1] leading-relaxed font-light">
                    À Grasse, berceau mondial du parfum, nos maîtres artisans assemblent des extraits purs selon des recettes traditionnelles. Nos Eaux de Parfum renferment une concentration rare de <strong>15% à 20%</strong> sur base d&apos;alcool végétal, sans phtalates ni colorants synthétiques agressifs.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 text-sm text-[#E7E2DA]">
                    <div className="flex items-start gap-3">
                      <Droplets className="w-5 h-5 text-[#D4A359] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium mb-0.5 text-sm sm:text-[15px]">
                          Alcool d&apos;Origine Végétale
                        </strong>
                        <span className="text-[#A8A29E] font-light text-xs sm:text-sm">
                          Macération lente pour un sillage pur de 8 à 12h.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Flame className="w-5 h-5 text-[#D4A359] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-medium mb-0.5 text-sm sm:text-[15px]">
                          Cire 100% Végétale
                        </strong>
                        <span className="text-[#A8A29E] font-light text-xs sm:text-sm">
                          Combustion saine sans paraffine pétrochimique.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Link
                      href="/notre-histoire"
                      className="inline-flex items-center gap-2 text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold text-[#D4A359] hover:text-white transition-colors"
                    >
                      <span>Découvrir notre histoire complète</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#44403C]">
                    <Image
                      src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800"
                      alt="Flacon de parfum noble Club Parfum"
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECCIÓN 5: DIAGNOSTIC OLFACTIF EN 30S + FAQ COMPACTO       */}
        {/* ========================================================= */}
        <section
          id="diagnostic-olfactif"
          className="py-20 bg-[#F5F2EB]/50 border-b border-[#E7E2DA] scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <OlfactoryQuiz />
          </div>
        </section>

        {/* FAQ Compacte et Liens de Contact */}
        <section id="faq" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-[#A16207] block">
              Vos Questions • Nos Réponses
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight leading-[1.18]">
              Foire Aux Questions Olfactive
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-light">
              Tout ce que vous souhaitez savoir sur le choix d&apos;une fragrance, nos compositions de Grasse et les expéditions.
            </p>
          </div>

          <HomeFaqAccordion />

          <div className="mt-12 text-center text-sm sm:text-[15px] text-[#57534E]">
            <span>Une question particulière sur une création ? </span>
            <a
              href="https://wa.me/33769914251?text=Bonjour%20Club%20Parfum,%20j'ai%20une%20question%20sur%20vos%20produits"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A16207] font-semibold underline hover:text-[#1C1917] transition-colors ml-1 inline-flex items-center gap-1"
            >
              <MessageCircle className="w-4 h-4 text-[#A16207]" />
              <span>Échangez directement avec nous sur WhatsApp</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
