"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  MessageCircle,
  Menu,
  X,
  Search,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileParfumsOpen, setMobileParfumsOpen] = useState(false);
  const [mobileMaisonOpen, setMobileMaisonOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  return (
    <>
      {/* Announcement Bar Supérieure (Confiance & Livraison Gratuite) */}
      <aside
        aria-label="Offre spéciale livraison"
        className="py-2.5 px-4 bg-[#1C1917] text-[#FAFAF8] text-[11px] sm:text-xs tracking-[0.18em] uppercase border-b border-[#44403C]/40 text-center"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>Fabrication Française à Grasse</span>
          <span className="text-[#A16207]">•</span>
          <span className="font-semibold text-[#FAFAF8]">
            Livraison offerte dès 60 € d&apos;achat
          </span>
          <span className="hidden sm:inline text-[#A16207]">•</span>
          <span className="hidden sm:inline text-[#E7E2DA]">
            Expédition 48h/72h
          </span>
        </div>
      </aside>

      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E7E2DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[84px] py-3 gap-6">
            {/* Logo / Maison de Parfum en une seule ligne */}
            <Link
              href="/"
              className="group flex flex-col items-start shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A16207] rounded-sm py-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="font-serif text-xl sm:text-2xl lg:text-[26px] tracking-[0.22em] font-normal text-[#1C1917] uppercase whitespace-nowrap leading-none transition-colors group-hover:text-[#A16207]">
                Club Parfum
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-[#A16207] font-medium mt-1.5 whitespace-nowrap leading-none font-sans">
                Maison de Senteurs • Grasse
              </span>
            </Link>

            {/* Navigation Desktop avec Menus Déroulants en Sentence Case (15px-16px) */}
            <nav
              aria-label="Navigation principale"
              className="hidden lg:flex items-center gap-7 xl:gap-9"
            >
              {/* Dropdown 1 : Parfums */}
              <div className="relative group">
                <Link
                  href="/categories/eaux-de-parfum"
                  className="whitespace-nowrap text-[15px] lg:text-[16px] font-normal text-[#292524] hover:text-[#A16207] transition-colors py-3 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Parfums</span>
                  <ChevronDown className="w-4 h-4 text-[#78716C] group-hover:text-[#A16207] transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                {/* Menu Flottant Blanc */}
                <div className="absolute left-0 top-full pt-1.5 w-72 z-50 hidden group-hover:block transition-all duration-200">
                  <div className="bg-white border border-[#E7E2DA] shadow-[0_14px_34px_rgba(28,25,23,0.12)] py-2">
                    <Link
                      href="/categories/eaux-de-parfum"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Eaux de Parfum (15-20%)</span>
                    </Link>
                    <Link
                      href="/categories/famille-orientale"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Famille Orientale & Ambrée</span>
                    </Link>
                    <Link
                      href="/categories/famille-poudree"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Famille Fleurie & Poudrée</span>
                    </Link>
                    <Link
                      href="/categories/collection-privee"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Collection Privée</span>
                    </Link>
                    <div className="border-t border-[#F2EFE9] my-1" />
                    <Link
                      href="/categories/format-decouverte"
                      className="px-5 py-2.5 text-[15px] text-[#A16207] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between font-medium transition-colors"
                    >
                      <span>Formats Découverte 10 ml</span>
                      <span className="text-[11px] bg-[#FAF8F5] text-[#A16207] px-2 py-0.5 border border-[#E7E2DA]">
                        Dès 9,90 €
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dropdown 2 : Maison (Inspiré de Hogar) */}
              <div className="relative group">
                <Link
                  href="/categories/maison"
                  className="whitespace-nowrap text-[15px] lg:text-[16px] font-normal text-[#292524] hover:text-[#A16207] transition-colors py-3 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Maison</span>
                  <ChevronDown className="w-4 h-4 text-[#78716C] group-hover:text-[#A16207] transition-transform duration-200 group-hover:rotate-180" />
                </Link>

                {/* Menu Flottant Blanc */}
                <div className="absolute left-0 top-full pt-1.5 w-76 z-50 hidden group-hover:block transition-all duration-200">
                  <div className="bg-white border border-[#E7E2DA] shadow-[0_14px_34px_rgba(28,25,23,0.12)] py-2">
                    <Link
                      href="/categories/bougies-parfumees"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Bougies parfumées végétales</span>
                    </Link>
                    <Link
                      href="/categories/brumes-oreiller"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Brumes pour oreillers & linge</span>
                    </Link>
                    <Link
                      href="/categories/diffuseurs-ambiance"
                      className="px-5 py-2.5 text-[15px] text-[#44403C] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between transition-colors"
                    >
                      <span>Diffuseurs & Parfums d&apos;intérieur</span>
                      <ChevronRight className="w-4 h-4 text-[#78716C]" />
                    </Link>
                    <div className="border-t border-[#F2EFE9] my-1" />
                    <Link
                      href="/categories/maison"
                      className="px-5 py-2.5 text-[15px] text-[#A16207] hover:text-[#1C1917] hover:bg-[#FAF8F5] flex items-center justify-between font-medium transition-colors"
                    >
                      <span>Toute la gamme Maison</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A16207]" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Item 3 : La Boutique */}
              <Link
                href="/boutique"
                className="whitespace-nowrap text-[15px] lg:text-[16px] font-normal text-[#292524] hover:text-[#A16207] transition-colors py-3"
              >
                La Boutique
              </Link>

              {/* Item 4 : Diagnostic Olfactif */}
              <Link
                href="/#diagnostic-olfactif"
                className="whitespace-nowrap text-[15px] lg:text-[16px] font-medium text-[#A16207] hover:text-[#1C1917] transition-colors py-3 inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#A16207] shrink-0" />
                <span>Diagnostic Olfactif</span>
              </Link>
            </nav>

            {/* Actions Droite */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Accès rapide recherche boutique */}
              <Link
                href="/boutique"
                className="p-2.5 rounded-full text-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Rechercher une senteur ou un parfum"
                title="Rechercher une création"
              >
                <Search className="w-4.5 h-4.5 stroke-[1.5] text-[#44403C] hover:text-[#1C1917]" aria-hidden="true" />
              </Link>

              {/* Conseil WhatsApp discret */}
              <a
                href="https://wa.me/33769914251?text=Bonjour%20Club%20Parfum,%20j'aimerais%20un%20conseil%20personnalis%C3%A9%20sur%20vos%20senteurs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#1C1917] bg-[#F2EFE9] hover:bg-[#E7E2DA] rounded-full transition-all duration-200 cursor-pointer border border-[#E7E2DA]"
                title="Conseil personnalisé par WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#A16207] shrink-0" aria-hidden="true" />
                <span className="hidden xl:inline tracking-[0.14em] uppercase text-[11px] whitespace-nowrap">
                  Conseil
                </span>
              </a>

              {/* Panier interactif connecté au CartContext */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 rounded-full text-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Voir mon panier (${totalCount} articles)`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
                {totalCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#A16207] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Bouton Hamburger Mobile / Tablette */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-[#1C1917] hover:bg-[#F2EFE9] transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 stroke-[1.5]" />
                ) : (
                  <Menu className="w-6 h-6 stroke-[1.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Menu Déroulant Mobile Interactif */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-[#E7E2DA] py-5 px-3 space-y-3 bg-[#FAFAF8] text-[15px]">
              {/* Section Parfums */}
              <div className="border-b border-[#E7E2DA] pb-3">
                <button
                  type="button"
                  onClick={() => setMobileParfumsOpen(!mobileParfumsOpen)}
                  className="w-full flex items-center justify-between p-2 text-left font-medium text-[#1C1917]"
                >
                  <span>Parfums</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#78716C] transition-transform ${
                      mobileParfumsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileParfumsOpen && (
                  <div className="pl-4 pt-2 space-y-2 text-[#57534E]">
                    <Link
                      href="/categories/eaux-de-parfum"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Eaux de Parfum (15-20%)
                    </Link>
                    <Link
                      href="/categories/famille-orientale"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Famille Orientale & Ambrée
                    </Link>
                    <Link
                      href="/categories/famille-poudree"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Famille Fleurie & Poudrée
                    </Link>
                    <Link
                      href="/categories/collection-privee"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Collection Privée
                    </Link>
                    <Link
                      href="/categories/format-decouverte"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 text-[#A16207] font-medium"
                    >
                      Formats Découverte 10 ml
                    </Link>
                  </div>
                )}
              </div>

              {/* Section Maison */}
              <div className="border-b border-[#E7E2DA] pb-3">
                <button
                  type="button"
                  onClick={() => setMobileMaisonOpen(!mobileMaisonOpen)}
                  className="w-full flex items-center justify-between p-2 text-left font-medium text-[#1C1917]"
                >
                  <span>Maison</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#78716C] transition-transform ${
                      mobileMaisonOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileMaisonOpen && (
                  <div className="pl-4 pt-2 space-y-2 text-[#57534E]">
                    <Link
                      href="/categories/bougies-parfumees"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Bougies parfumées végétales
                    </Link>
                    <Link
                      href="/categories/brumes-oreiller"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Brumes pour oreillers & linge
                    </Link>
                    <Link
                      href="/categories/diffuseurs-ambiance"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 hover:text-[#1C1917]"
                    >
                      Diffuseurs & Parfums d&apos;intérieur
                    </Link>
                    <Link
                      href="/categories/maison"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 text-[#A16207] font-medium"
                    >
                      Toute la gamme Maison
                    </Link>
                  </div>
                )}
              </div>

              {/* La Boutique */}
              <Link
                href="/boutique"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 font-medium text-[#1C1917]"
              >
                <span>La Boutique (Catalogue Complet)</span>
                <span className="text-[#A16207]">→</span>
              </Link>

              {/* Diagnostic Olfactif */}
              <Link
                href="/#diagnostic-olfactif"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-lg bg-[#F5F2EB] border border-[#E7E2DA] font-medium text-[#A16207]"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Diagnostic Olfactif (30s)</span>
                </span>
                <span>→</span>
              </Link>

              {/* Enlaces secundarios */}
              <div className="pt-3 border-t border-[#E7E2DA] flex flex-wrap items-center justify-between gap-3 px-2 text-[13px] text-[#57534E]">
                <Link
                  href="/notre-histoire"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1C1917] py-1"
                >
                  Notre Histoire
                </Link>
                <Link
                  href="/livraison"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1C1917] py-1"
                >
                  Livraisons & Retours
                </Link>
              </div>

              {/* Contact WhatsApp Mobile */}
              <div className="pt-2 px-2">
                <a
                  href="https://wa.me/33769914251?text=Bonjour%20Club%20Parfum,%20j'aimerais%20un%20conseil%20personnalis%C3%A9%20sur%20vos%20senteurs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#F2EFE9] text-xs font-medium text-[#1C1917] border border-[#E7E2DA]"
                >
                  <MessageCircle className="w-4 h-4 text-[#A16207]" />
                  <span>Conseil WhatsApp (+33 7 69 91 42 51)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
