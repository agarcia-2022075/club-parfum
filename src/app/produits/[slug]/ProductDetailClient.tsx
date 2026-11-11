"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, ProductVariant } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  Check,
  MessageCircle,
  Sparkles,
  AlertCircle,
  Info,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import { getOlfactoryTheme } from "@/lib/olfactory-theme";

interface Props {
  product?: Product | null;
  slug?: string;
}

export function ProductDetailClient({ product: initialProduct, slug }: Props) {
  const { getProductBySlug } = useCatalog();
  const product = (initialProduct ? getProductBySlug(initialProduct.slug) || initialProduct : null)
    || (slug ? getProductBySlug(slug) : null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(() => {
    return (
      product?.variants?.find((v) => v.in_stock !== false) ||
      product?.variants?.[0] ||
      null
    );
  });
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      if (
        !selectedVariant ||
        (selectedVariant.in_stock === false &&
          product.variants.some((v) => v.in_stock !== false))
      ) {
        setSelectedVariant(
          product.variants.find((v) => v.in_stock !== false) || product.variants[0]
        );
      }
    }
  }, [product, selectedVariant]);

  if (!product) {
    return (
      <div className="py-16 text-center space-y-5 bg-white rounded-2xl border border-[#E7E2DA] p-8 max-w-xl mx-auto shadow-xs my-8">
        <div className="w-16 h-16 rounded-full bg-[#F2EFE9] text-[#A16207] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A16207] font-semibold block">
            Maison Club Parfum
          </span>
          <h2 className="font-serif text-3xl text-[#1C1917]">Création introuvable</h2>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-md mx-auto">
            Cette référence n&apos;est pas disponible actuellement ou a été retirée de notre catalogue artisanal.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-wider transition shadow-xs"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Retour à la boutique</span>
          </Link>
        </div>
      </div>
    );
  }

  const theme = getOlfactoryTheme(product.olfactory_family);
  const allVariantsOutOfStock = Boolean(
    product.variants &&
    product.variants.length > 0 &&
    product.variants.every((v) => v.in_stock === false)
  );
  const isOutOfStock = product.is_active === false || allVariantsOutOfStock;
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;

  const handleAddToCart = () => {
    if (isOutOfStock || selectedVariant?.in_stock === false) return;
    addItem(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const shareText = `Bonjour Club Parfum, je souhaite des conseils ou me renseigner sur la disponibilité de la création "${product.name}" (${selectedVariant?.size_label || "Format standard"}).`;
  const whatsappUrl = `https://wa.me/33769914251?text=${encodeURIComponent(shareText)}`;

  const isCandle = product.category_name.toLowerCase().includes("bougie");
  const productImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      {/* Galerie Visuelle du Produit */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F2EFE9] border border-[#E7E2DA] shadow-lg">
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover object-center transition-all duration-500 ${
              isOutOfStock ? "grayscale-30 opacity-85" : ""
            }`}
            priority
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="px-3.5 py-1.5 text-xs font-semibold tracking-[0.2em] uppercase bg-[#FAFAF8]/95 backdrop-blur-sm text-[#1C1917] rounded-sm shadow-xs border border-[#E7E2DA]">
              {product.category_name}
            </span>
            {product.olfactory_family && (
              <span
                className={`px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase rounded-sm border shadow-xs flex items-center gap-1.5 backdrop-blur-xs ${theme.tagClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${theme.dot}`} />
                {product.olfactory_family}
              </span>
            )}
          </div>

          {isOutOfStock && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase bg-[#1C1917] text-white rounded-md shadow-lg border border-[#44403C]">
                Momentanément Épuisé
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Informations & Achat (Éditorial Haute Parfumerie) */}
      <div className="lg:col-span-6 space-y-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs sm:text-[13px] uppercase tracking-[0.24em] text-[#A16207] font-semibold block">
              Haute Création • Grasse
            </span>
            {product.olfactory_family && (
              <>
                <span className="text-[#A16207]">•</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs sm:text-[13px] font-semibold tracking-wider uppercase border ${theme.tagClass}`}
                >
                  {product.olfactory_family} — {theme.mood}
                </span>
              </>
            )}
            {product.facets && (
              <>
                <span className="text-[#A16207]">•</span>
                <span className="text-sm font-medium text-[#57534E] tracking-wider uppercase">
                  {product.facets}
                </span>
              </>
            )}
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-serif text-3xl sm:text-4xl font-medium text-[#1C1917]">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-sm text-[#57534E]">
              TTC • Livraison offerte dès 60 €
            </span>
          </div>
        </div>

        {/* Jauge d'intensité sensorielle et sillage */}
        <div className="p-4 rounded-xl bg-white border border-[#E7E2DA] flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-xs sm:text-[13px] uppercase tracking-wider font-semibold text-[#1C1917] block">
              {isCandle ? "Diffusion dans l'espace" : "Intensité du Sillage"}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((dot) => (
                <span
                  key={dot}
                  className={`w-2.5 h-2.5 rounded-full ${
                    dot <= (isCandle ? 5 : 4) ? "bg-[#A16207]" : "bg-[#E7E2DA]"
                  }`}
                />
              ))}
              <span className="text-sm text-[#57534E] font-medium ml-1">
                {isCandle ? "5/5 (Diffusion Intense)" : "4/5 (Sillage Remarquable)"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs sm:text-[13px] uppercase tracking-wider font-semibold text-[#1C1917] block">
              {isCandle ? "Durée de Combustion" : "Tenue sur Peau"}
            </span>
            <span className="text-sm text-[#A16207] font-semibold">
              {isCandle ? "≈ 45 heures de brûlage" : "8h à 12h d'évolution"}
            </span>
          </div>
        </div>

        {/* Description olfactive */}
        <p className="text-base sm:text-[17px] text-[#44403C] leading-relaxed font-normal">
          {product.description}
        </p>

        {/* PYRAMIDE OLFACTIVE DE LUXE EN 3 NIVEAUX (Tête, Cœur, Fond) */}
        {product.olfactory_pyramid && (
          <div className="p-6 rounded-2xl bg-white border border-[#E7E2DA] space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#A16207]">
                <Sparkles className="w-4 h-4 text-[#A16207]" aria-hidden="true" />
                <span>Pyramide Olfactive Structurée</span>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${theme.tagClass}`}
              >
                {product.olfactory_family}
              </span>
            </div>

            <div className="space-y-4">
              {/* 01. Notes de Tête */}
              <div className="group rounded-xl p-3.5 bg-[#FAFAF8] border border-[#E7E2DA] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#1C1917] flex items-center gap-1.5">
                    <span className="text-[#A16207] font-mono">01.</span> Notes de Tête
                  </span>
                  <span className="text-xs text-[#57534E] italic">
                    L&apos;éclat initial • 15 premières minutes
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.olfactory_pyramid.top_notes.map((note, idx) => (
                    <span
                      key={idx}
                      className="text-sm text-[#1C1917] bg-white border border-[#E7E2DA] px-3 py-1 rounded-md font-medium shadow-2xs"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* 02. Notes de Cœur */}
              <div className="group rounded-xl p-3.5 bg-[#FAFAF8] border border-[#E7E2DA] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#1C1917] flex items-center gap-1.5">
                    <span className="text-[#A16207] font-mono">02.</span> Notes de Cœur
                  </span>
                  <span className="text-xs text-[#57534E] italic">
                    L&apos;âme de la fragrance • 2h à 4h
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.olfactory_pyramid.heart_notes.map((note, idx) => (
                    <span
                      key={idx}
                      className="text-sm text-[#1C1917] bg-white border border-[#E7E2DA] px-3 py-1 rounded-md font-medium shadow-2xs"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* 03. Notes de Fond */}
              <div className="group rounded-xl p-3.5 bg-[#FAFAF8] border border-[#E7E2DA] transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-[13px] font-bold uppercase tracking-[0.16em] text-[#1C1917] flex items-center gap-1.5">
                    <span className="text-[#A16207] font-mono">03.</span> Notes de Fond
                  </span>
                  <span className="text-xs text-[#57534E] italic">
                    Le sillage persistant • 6h à 24h
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {product.olfactory_pyramid.base_notes.map((note, idx) => (
                    <span
                      key={idx}
                      className="text-sm text-[#1C1917] bg-white border border-[#E7E2DA] px-3 py-1 rounded-md font-medium shadow-2xs"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Détails techniques & Astuce d'utilisation */}
            {product.concentration_info && (
              <div className="pt-3 border-t border-[#F2EFE9] space-y-2 text-sm text-[#57534E]">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#A16207] shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="leading-relaxed font-normal">{product.concentration_info}</p>
                </div>
                <div className="bg-[#F2EFE9]/60 p-3 rounded-lg border border-[#E7E2DA] text-sm text-[#1C1917] leading-relaxed">
                  <strong className="text-[#A16207]">Conseil de la Maison :</strong> Testez le format découverte 10 ml sur votre peau ou allumez la bougie par sessions de 2h minimum pour une diffusion optimale sans creuser la cire.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sélecteur de format si variantes disponibles */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1C1917] block">
                Format & Contenance :
              </label>
              <span className="text-xs sm:text-[13px] text-[#A16207] font-medium">
                {selectedVariant?.size_label.toLowerCase().includes("10 ml") ||
                selectedVariant?.size_label.toLowerCase().includes("10ml")
                  ? "Idéal pour tester sans risque"
                  : "Format signature"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const isOutOfStockVariant = v.in_stock === false;
                const isDiscovery =
                  v.size_label.toLowerCase().includes("10 ml") ||
                  v.size_label.toLowerCase().includes("10ml");
                const isLarge =
                  v.size_label.toLowerCase().includes("100 ml") ||
                  v.size_label.toLowerCase().includes("300 g");

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={isOutOfStockVariant}
                    onClick={() => {
                      if (!isOutOfStockVariant) {
                        setSelectedVariant(v);
                      }
                    }}
                    className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
                      isOutOfStockVariant
                        ? "opacity-55 bg-[#F2EFE9] border-dashed border-[#DCD5C9] cursor-not-allowed"
                        : isSelected
                        ? "border-[#A16207] bg-[#A16207]/10 ring-1 ring-[#A16207] cursor-pointer"
                        : "border-[#E7E2DA] bg-white hover:border-[#1C1917] cursor-pointer"
                    }`}
                  >
                    {isOutOfStockVariant ? (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-neutral-200 text-neutral-600 border border-neutral-300 px-1.5 py-0.5 rounded">
                        Épuisé
                      </span>
                    ) : isDiscovery ? (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-[#FDF8EE] text-[#92400E] border border-[#EED9B3] px-1.5 py-0.5 rounded">
                        Essai sans risque
                      </span>
                    ) : isLarge ? (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider bg-white text-[#1C1917] border border-[#E7E2DA] px-1.5 py-0.5 rounded">
                        Grand Format
                      </span>
                    ) : null}
                    <p className={`text-sm sm:text-[15px] font-semibold ${isSelected && !isOutOfStockVariant ? "text-[#92400E]" : "text-[#1C1917]"}`}>
                      {v.size_label}
                    </p>
                    <p className="text-sm sm:text-base text-[#57534E] mt-0.5 font-semibold">{formatPrice(v.price)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantité & Bouton d'Ajout ou Bouton Rupture */}
        <div className="space-y-4 pt-2">
          {isOutOfStock ? (
            <div className="p-5 rounded-2xl bg-[#F2EFE9] border border-[#E7E2DA] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                <AlertCircle className="w-4 h-4 text-[#A16207]" />
                <span>Ce produit est momentanément victime de son succès</span>
              </div>
              <p className="text-sm text-[#57534E] leading-relaxed font-normal">
                Nos créations sont confectionnées à la main en séries limitées. Contactez-nous pour connaître la date de prochaine fabrication à Grasse.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Être alerté(e) du réassort sur WhatsApp</span>
              </a>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Contrôle de Quantité */}
              <div className="flex items-center justify-between sm:justify-start border border-[#E7E2DA] rounded-xl bg-white px-3 py-2 min-h-[50px] shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center text-base font-bold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                  aria-label="Diminuer la quantité"
                >
                  -
                </button>
                <span className="w-9 text-center text-sm sm:text-base font-semibold text-[#1C1917]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center text-base font-bold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>

              {/* Bouton Ajouter au Panier */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 min-h-[50px] px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#A16207] shadow-md ${
                  isAdded
                    ? "bg-emerald-800 text-white"
                    : "bg-[#1C1917] hover:bg-[#A16207] text-white active:scale-98"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Ajouté au Panier ({quantity})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Ajouter au Panier • {formatPrice(currentPrice * quantity)}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Bouton Poser une Question WhatsApp sur cette fragrance */}
          {!isOutOfStock && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[46px] py-3 px-5 rounded-xl border border-[#E7E2DA] bg-white hover:bg-[#F2EFE9] text-[#1C1917] text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-[#A16207]" />
              <span>Demander un avis olfactif sur WhatsApp</span>
            </a>
          )}

          {/* Micro-réassurance d'achat sous le CTA */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left border-t border-[#E7E2DA] text-xs sm:text-[13px] text-[#57534E]">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="w-4 h-4 text-[#A16207] shrink-0" />
              <span>Paiement sécurisé (CB, Apple Pay)</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Truck className="w-4 h-4 text-[#A16207] shrink-0" />
              <span>Expédition 24/48h • Offerte dès 60 €</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Sparkles className="w-4 h-4 text-[#A16207] shrink-0" />
              <span>Échantillon surprise offert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
