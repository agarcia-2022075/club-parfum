"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { getOlfactoryTheme } from "@/lib/olfactory-theme";
import { Product } from "@/types/store";
import { 
  Sparkles, 
  RotateCcw, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  Flame, 
  Heart,
  Gift
} from "lucide-react";

type UsageType = "peau" | "maison" | "cadeau";
type MoodType = "chaleureux" | "propre" | "floral" | "boise";

export function OlfactoryQuiz() {
  const { products } = useCatalog();
  const { addItem } = useCart();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedUsage, setSelectedUsage] = useState<UsageType | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const handleSelectUsage = (usage: UsageType) => {
    setSelectedUsage(usage);
    setStep(2);
  };

  const handleSelectMood = (mood: MoodType) => {
    setSelectedMood(mood);
    setStep(3);
  };

  const resetQuiz = () => {
    setSelectedUsage(null);
    setSelectedMood(null);
    setStep(1);
    setAddedProductId(null);
  };

  // Recommandation intelligente selon les 2 choix
  const recommendations = useMemo(() => {
    if (!selectedUsage || !selectedMood) return [];

    let pool = [...products].filter((p) => p.is_active);

    // 1. Filtrer par type d'usage
    if (selectedUsage === "peau") {
      pool = pool.filter((p) => p.category_id === "cat-2");
    } else if (selectedUsage === "maison") {
      pool = pool.filter((p) => p.category_id === "cat-1" || p.category_id === "cat-3");
    }

    // 2. Filtrer par univers olfactif
    const moodMap: Record<MoodType, string[]> = {
      chaleureux: ["Orientale", "Gourmande"],
      propre: ["Poudrée"],
      floral: ["Fleurie"],
      boise: ["Boisée"],
    };

    const targetFamilies = moodMap[selectedMood] || [];
    const directMatches = pool.filter((p) => targetFamilies.includes(p.olfactory_family));

    if (directMatches.length >= 2) {
      return directMatches.slice(0, 2);
    }

    // Compléter avec le reste du pool si besoin
    const others = pool.filter((p) => !directMatches.includes(p));
    return [...directMatches, ...others].slice(0, 2);
  }, [products, selectedUsage, selectedMood]);

  const handleQuickAdd = (product: Product) => {
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    addItem(product, defaultVariant, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#E7E2DA] text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A16207]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prescription Olfactive Personnalisée</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight leading-[1.18]">
          Diagnostic Olfactif en 30 secondes
        </h2>
        <p className="text-sm sm:text-[15px] text-[#44403C] leading-relaxed">
          Hésitez-vous sur le choix d&apos;une fragrance ? Répondez à 2 questions simples pour révéler les accords de Grasse qui correspondent à votre tempérament.
        </p>

        {/* Jauge d'étape */}
        <div className="pt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-xs font-semibold text-[#57534E] mb-2">
            <span>Étape {step} sur 3</span>
            <span>{step === 1 ? "Usage souhaité" : step === 2 ? "Atmosphère" : "Vos créations idéales"}</span>
          </div>
          <div className="w-full h-1.5 bg-[#E7E2DA] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A16207] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ÉTAPE 1 : USAGE */}
      {step === 1 && (
        <div className="space-y-4 reveal-up">
          <h3 className="text-center font-serif text-2xl text-[#1C1917] mb-6">
            Que recherchez-vous aujourd&apos;hui ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => handleSelectUsage("peau")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] mb-4 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-xl text-[#1C1917] mb-1.5">Un parfum de peau</h4>
              <p className="text-sm text-[#44403C] leading-relaxed">
                Une Eau de Parfum concentrée (15-20%) qui révèle votre signature intime tout au long de la journée.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectUsage("maison")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] mb-4 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-xl text-[#1C1917] mb-1.5">Parfumer mon intérieur</h4>
              <p className="text-sm text-[#44403C] leading-relaxed">
                Des bougies 100% cire végétale, brumes d&apos;oreiller ou diffuseurs pour transformer votre pièce en havre chaleureux.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectUsage("cadeau")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="w-12 h-12 bg-[#FAF8F5] border border-[#E7E2DA] flex items-center justify-center text-[#A16207] mb-4 group-hover:scale-105 transition-transform">
                <Gift className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-xl text-[#1C1917] mb-1.5">Une idée cadeau raffinée</h4>
              <p className="text-sm text-[#44403C] leading-relaxed">
                Offrir le prestige d&apos;une création de Grasse sans risquer de décevoir (nos incontournables plébiscités).
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 2 : ATMOSPHÈRE */}
      {step === 2 && (
        <div className="space-y-4 reveal-up">
          <h3 className="text-center font-serif text-2xl text-[#1C1917] mb-6">
            Quelle atmosphère olfactive vous attire le plus ?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleSelectMood("chaleureux")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A16207]" />
                <h4 className="font-serif text-xl text-[#1C1917]">Chaleureuse, ambrée & vanillée</h4>
              </div>
              <p className="text-sm text-[#44403C] leading-relaxed">
                Des notes d&apos;ambre doré, de gousses de vanille bourbon et d&apos;épices douces. Réconfortant, sensuel et enveloppant.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMood("propre")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#78716C]" />
                <h4 className="font-serif text-xl text-[#1C1917]">Propre, douce & cotonneuse</h4>
              </div>
              <p className="text-sm text-[#44403C] leading-relaxed">
                La sensation pure du linge frais séché au vent, de la fleur de coton, de l&apos;iris poudré et du musc blanc caressant.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMood("floral")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#854D0E]" />
                <h4 className="font-serif text-xl text-[#1C1917]">Lumineuse, florale & solaire</h4>
              </div>
              <p className="text-sm text-[#44403C] leading-relaxed">
                La fleur d&apos;oranger de Grasse, le néroli pur et les pétales de rose délicate. Un jardin méditerranéen baigné de lumière.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMood("boise")}
              className="p-6 border border-[#E7E2DA] bg-white hover:border-[#A16207] hover:shadow-md transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#57534E]" />
                <h4 className="font-serif text-xl text-[#1C1917]">Boisée, noble & apaisante</h4>
              </div>
              <p className="text-sm text-[#44403C] leading-relaxed">
                Le cèdre majestueux de l&apos;Atlas, la sauge sclarée provençale et le vétiver fumé. Respiration et sérénité intérieure.
              </p>
            </button>
          </div>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-[#57534E] hover:text-[#1C1917] underline cursor-pointer"
            >
              ← Revenir à l&apos;étape précédente
            </button>
          </div>
        </div>
      )}

      {/* ÉTAPE 3 : RÉSULTAT / PRESCRIPTION SUR-MESURE */}
      {step === 3 && (
        <div className="space-y-6 reveal-up">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#1C1917]">
              Vos 2 créations signatures recommandées
            </h3>
            <p className="text-sm sm:text-base text-[#44403C]">
              Sélectionnées par nos maîtres parfumeurs selon vos préférences olfactives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((prod) => {
              const theme = getOlfactoryTheme(prod.olfactory_family);
              const isAdded = addedProductId === prod.id;
              const hasDiscovery = prod.variants?.some((v) => v.size_label.includes("10 ml"));

              return (
                <div
                  key={prod.id}
                  className={`p-6 border ${theme.border} ${theme.bg} shadow-sm flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="relative w-24 h-24 overflow-hidden bg-white shrink-0 border border-[#E7E2DA]">
                        <Image
                          src={prod.images[0]}
                          alt={prod.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#92400E]">
                            {prod.olfactory_family} • {theme.mood}
                          </span>
                        </div>
                        <Link href={`/produits/${prod.slug}`}>
                          <h4 className="font-serif text-xl sm:text-2xl text-[#1C1917] hover:text-[#A16207] transition leading-snug">
                            {prod.name}
                          </h4>
                        </Link>
                        {hasDiscovery && (
                          <span className="inline-block mt-1 text-xs font-medium text-[#1C1917] bg-white border border-[#E7E2DA] px-2 py-0.5">
                            Format 10 ml dès 9,90 €
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[#44403C] leading-relaxed mb-4 line-clamp-2">
                      {prod.description}
                    </p>

                    {/* Notes clés */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {prod.scent_notes.map((note, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium bg-white text-[#1C1917] border border-[#E7E2DA] px-2.5 py-0.5"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E7E2DA] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#57534E] block">À partir de</span>
                      <span className="font-serif text-2xl font-semibold text-[#1C1917]">
                        {formatPrice(prod.base_price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/produits/${prod.slug}`}
                        className="px-3.5 py-2 border border-[#E7E2DA] text-[#1C1917] hover:border-[#1C1917] text-xs font-medium tracking-[0.14em] uppercase transition cursor-pointer"
                      >
                        Options
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleQuickAdd(prod)}
                        className={`min-h-[40px] px-5 py-2 text-xs font-semibold tracking-[0.16em] uppercase transition flex items-center gap-1.5 cursor-pointer ${
                          isAdded
                            ? "bg-[#44403C] text-white"
                            : "bg-[#1C1917] hover:bg-[#A16207] text-white"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Ajouté</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Ajouter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <button
              type="button"
              onClick={resetQuiz}
              className="inline-flex items-center gap-1.5 text-[#57534E] hover:text-[#1C1917] font-medium underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Recommencer le diagnostic</span>
            </button>

            <span className="text-[#A16207] hidden sm:inline">•</span>

            <Link
              href="/boutique"
              className="inline-flex items-center gap-1 text-[#A16207] hover:text-[#1C1917] font-semibold uppercase tracking-[0.16em]"
            >
              <span>Explorer tout le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
