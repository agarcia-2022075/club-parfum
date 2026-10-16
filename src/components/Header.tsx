import Link from "next/link";
import { ShoppingBag, Sparkles, MessageCircle } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8DFD8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Nombre de marca */}
          <Link href="/" className="group flex flex-col items-center sm:items-start">
            <span className="font-serif text-2xl tracking-[0.2em] font-light text-[#2A2421] uppercase transition group-hover:opacity-80">
              Club Parfum
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#9C6D49] font-medium -mt-1">
              Maison de Senteurs
            </span>
          </Link>

          {/* Navegación central */}
          <nav className="hidden md:flex items-center space-x-8 text-sm text-[#70655E] tracking-wider uppercase font-medium">
            <Link href="#collections" className="hover:text-[#2A2421] transition">
              Collections
            </Link>
            <Link href="#valeurs" className="hover:text-[#2A2421] transition">
              Notre Savoir-Faire
            </Link>
            <Link href="#livraison" className="hover:text-[#2A2421] transition">
              Livraison
            </Link>
          </nav>

          {/* Acciones derecha */}
          <div className="flex items-center space-x-3">
            {/* Botón WhatsApp */}
            <a
              href="https://wa.me/?text=Bonjour%20Club%20Parfum,%20j'aimerais%20des%20conseils%20sur%20vos%20produits"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2A2421] bg-[#F2EBE3] hover:bg-[#E8DCC4] rounded-full transition"
              title="Conseil personnalisé par WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Conseil WhatsApp</span>
            </a>

            {/* Carrito de compras */}
            <button
              className="relative p-2.5 rounded-full text-[#2A2421] hover:bg-[#F2EBE3] transition"
              aria-label="Panier"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#9C6D49] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
