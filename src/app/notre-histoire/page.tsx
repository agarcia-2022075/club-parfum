import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sparkles, Heart, ShieldCheck, Flower2, Flame, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotreHistoirePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* En-tête de la page */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block">
            Maison Artisanale
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal tracking-tight">
            Notre Histoire & Nos Valeurs
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-light">
            Une passion familiale pour les fragrances délicates, pensée pour créer chez vous une atmosphère chaleureuse, saine et mémorable.
          </p>
        </div>

        {/* Section 1 : La Vision Familiale */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center mb-20">
          <div className="md:col-span-6 relative aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-[#E7E2DA]">
            <Image
              src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=900"
              alt="Atelier Club Parfum création de bougies"
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="md:col-span-6 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#A16207] block">
              L'Origine
            </span>
            <h2 className="font-serif text-3xl text-[#1C1917] font-normal leading-snug">
              L'envie de transformer un intérieur en cocon de bien-être.
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
              Club Parfum est né d'une conviction simple : le parfum d'une maison ne doit pas seulement masquer des odeurs, il doit éveiller des souvenirs, apaiser l'esprit et offrir un sentiment immédiat de réconfort après une longue journée.
            </p>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
              Chaque produit que nous proposons a été pensé et testé avec exigence pour trouver l'équilibre parfait entre subtilité et intensité olfactive.
            </p>
          </div>
        </div>

        {/* Section 2 : Les 3 Piliers de Qualité (Ancien Savoir-Faire clarifié) */}
        <div className="bg-[#F2EFE9] p-8 sm:p-12 rounded-3xl border border-[#E7E2DA] mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-serif text-3xl text-[#1C1917] font-normal">
              Nos Engagements Qualité
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] mt-2 font-light">
              Ce qui rend nos créations uniques et respectueuses de votre santé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#A16207]">
                <Flame className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1917]">Cires 100% Végétales</h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-light">
                Zéro paraffine issue de la pétrochimie. Nos cires de soja et de colza assurent une combustion saine, uniforme et sans émanations toxiques dans votre foyer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#A16207]">
                <Flower2 className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1917]">Parfums de Grasse</h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-light">
                Nous travaillons avec des essences élaborées à Grasse, berceau mondial de la haute parfumerie, certifiées conformes aux normes européennes IFRA.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#A16207]">
                <Heart className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-xl text-[#1C1917]">Fait en France</h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-light">
                Coulage méticuleux, mèches en coton naturel centrées à la main et contrôle attentif de chaque flacon avant son expédition chez vous.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 : Invitation à Découvrir */}
        <div className="text-center bg-white p-10 rounded-3xl border border-[#E7E2DA] shadow-sm space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal">
            Laissez-vous tenter par une nouvelle ambiance
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] max-w-lg mx-auto leading-relaxed font-light">
            Bougies gourmandes, fragrances fraîches ou diffuseurs boisés : trouvez la senteur qui correspond à votre intérieur.
          </p>
          <div className="pt-2">
            <Link
              href="/boutique"
              className="inline-flex min-h-[48px] px-8 py-3.5 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-300 items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>Voir le catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
