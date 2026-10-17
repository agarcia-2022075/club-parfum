"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, MessageCircle, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E7E2DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Maison de Parfum */}
          <Link 
            href="/" 
            className="group flex flex-col items-start cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A16207] rounded-sm p-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-light text-[#1C1917] uppercase transition-colors group-hover:text-[#A16207]">
              Club Parfum
            </span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#A16207] font-medium -mt-1 font-sans">
              Maison de Senteurs • France
            </span>
          </Link>

          {/* Navigation Bureau */}
          <nav className="hidden md:flex items-center space-x-10 text-xs text-[#57534E] tracking-[0.18em] uppercase font-medium">
            <Link 
              href="/boutique" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              La Boutique
            </Link>
            <Link 
              href="/notre-histoire" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              Notre Histoire
            </Link>
            <Link 
              href="/livraison" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              Livraison
            </Link>
            <Link 
              href="/admin" 
              className="text-[#A16207] hover:text-[#1C1917] transition-colors py-2 font-semibold"
            >
              Espace Gestion
            </Link>
          </nav>

          {/* Actions Droite */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Conseil WhatsApp */}
            <a
              href="https://wa.me/?text=Bonjour%20Club%20Parfum,%20j'aimerais%20un%20conseil%20personnalis%C3%A9%20sur%20vos%20senteurs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1C1917] bg-[#F2EFE9] hover:bg-[#E7E2DA] rounded-full transition-all duration-200 cursor-pointer border border-[#E7E2DA]"
              title="Conseil personnalisé par WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#A16207]" aria-hidden="true" />
              <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Conseil WhatsApp</span>
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
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#A16207] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Bouton Hamburger Mobile (Visible sur téléphones) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#1C1917] hover:bg-[#F2EFE9] transition cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
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
          <div className="md:hidden border-t border-[#E7E2DA] py-5 px-2 space-y-3 bg-[#FAFAF8] animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/boutique"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F2EFE9] text-sm font-medium text-[#1C1917] tracking-wider uppercase"
            >
              <span>La Boutique (Catalogue)</span>
              <span className="text-xs text-[#A16207]">→</span>
            </Link>
            <Link
              href="/notre-histoire"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F2EFE9] text-sm font-medium text-[#1C1917] tracking-wider uppercase"
            >
              <span>Notre Histoire</span>
              <span className="text-xs text-[#A16207]">→</span>
            </Link>
            <Link
              href="/livraison"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F2EFE9] text-sm font-medium text-[#1C1917] tracking-wider uppercase"
            >
              <span>Livraisons & Retours</span>
              <span className="text-xs text-[#A16207]">→</span>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#F2EFE9] text-sm font-semibold text-[#A16207] tracking-wider uppercase"
            >
              <span>Espace Gestion (Admin)</span>
              <span className="text-xs">🔒</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
