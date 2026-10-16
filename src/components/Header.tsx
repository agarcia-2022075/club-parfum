import Link from "next/link";
import { ShoppingBag, MessageCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E7E2DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Maison de Parfum */}
          <Link href="/" className="group flex flex-col items-start cursor-pointer focus-visible:ring-2 focus-visible:ring-[#A16207] rounded-sm p-1">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-light text-[#1C1917] uppercase transition-colors group-hover:text-[#A16207]">
              Club Parfum
            </span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-[#A16207] font-medium -mt-1 font-sans">
              Maison de Senteurs • France
            </span>
          </Link>

          {/* Navigation centrale épurée (Taste-skill: pas de kickers superflus) */}
          <nav className="hidden md:flex items-center space-x-10 text-xs text-[#57534E] tracking-[0.18em] uppercase font-medium">
            <Link 
              href="#collections" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              Collections
            </Link>
            <Link 
              href="#savoir-faire" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              Le Savoir-Faire
            </Link>
            <Link 
              href="#livraison" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              Livraison
            </Link>
            <Link 
              href="#faq" 
              className="hover:text-[#1C1917] transition-colors py-2 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A16207] hover:after:w-full after:transition-all after:duration-300"
            >
              Conseils & FAQ
            </Link>
          </nav>

          {/* Actions interactives (Impeccable: 44px min touch target, transitions douces) */}
          <div className="flex items-center space-x-3">
            {/* Conseil olfactif WhatsApp */}
            <a
              href="https://wa.me/?text=Bonjour%20Club%20Parfum,%20j'aimerais%20un%20conseil%20personnalis%C3%A9%20sur%20vos%20senteurs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#1C1917] bg-[#F2EFE9] hover:bg-[#E7E2DA] rounded-full transition-all duration-200 cursor-pointer border border-[#E7E2DA] focus-visible:ring-2 focus-visible:ring-[#A16207]"
              title="Conseil personnalisé par WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#A16207]" aria-hidden="true" />
              <span className="hidden sm:inline tracking-wider uppercase text-[11px]">Conseil Olfactif</span>
            </a>

            {/* Bouton Panier */}
            <button
              className="relative p-2.5 rounded-full text-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#A16207]"
              aria-label="Voir mon panier (0 article)"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#A16207] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
