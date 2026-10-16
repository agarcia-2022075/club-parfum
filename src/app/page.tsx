import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS, CATEGORIES, SHIPPING_METHODS } from "@/data/mock-data";
import { Sparkles, Heart, Shield, ArrowRight, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Hero */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2EBE3] border border-[#E8DFD8] text-xs font-medium text-[#9C6D49]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Créations artisanales & Parfums d'ambiance</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#2A2421] font-light leading-[1.15]">
                L'art d'embaumer votre intérieur avec <span className="italic font-normal">élégance</span>.
              </h1>

              <p className="text-sm sm:text-base text-[#70655E] max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Des bougies végétales coulées avec passion, des parfums délicats et des diffuseurs conçus pour transformer votre foyer en un véritable cocon de sérénité.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="#collections"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2A2421] hover:bg-[#9C6D49] text-white text-xs font-medium uppercase tracking-widest transition flex items-center justify-center gap-2 group"
                >
                  <span>Découvrir la collection</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="https://wa.me/?text=Bonjour%20Club%20Parfum,%20j'aimerais%20des%20conseils%20sur%20vos%20senteurs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-[#E8DFD8] hover:border-[#9C6D49] text-[#2A2421] text-xs font-medium uppercase tracking-wider transition text-center shadow-xs"
                >
                  Un conseil olfactif ?
                </a>
              </div>
            </div>

            {/* Imagen Destacada Hero */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000"
                  alt="Bougie parfumée Club Parfum"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>

              {/* Tarjeta flotante sensorial */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-[#E8DFD8] hidden sm:flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F2EBE3] flex items-center justify-center text-[#9C6D49]">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#2A2421]">100% Cire Végétale</p>
                  <p className="text-[11px] text-[#70655E]">Brûle saine, sans émanations nocives</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATÁLOGO DE PRODUCTOS */}
        <section id="collections" className="py-16 bg-[#F2EBE3]/50 border-y border-[#E8DFD8]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#9C6D49] block mb-2">
                Nos Créations
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2A2421] font-light">
                La Sélection Signature
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#70655E] leading-relaxed">
                Chaque fragrance est sélectionnée pour son intensité et sa capacité à éveiller vos émotions.
              </p>
            </div>

            {/* Categorías filtro visual */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              <button className="px-4 py-2 rounded-full text-xs font-medium bg-[#2A2421] text-white">
                Tout voir
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className="px-4 py-2 rounded-full text-xs font-medium bg-white text-[#70655E] border border-[#E8DFD8] hover:border-[#9C6D49] hover:text-[#2A2421] transition"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Grid de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* MÉTODOS DE ENVÍO EN FRANCIA (SECCIÓN REASSURANCE) */}
        <section id="livraison" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#9C6D49] block mb-2">
              Expédition Facile
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2A2421] font-light">
              Nos Modes de Livraison en France
            </h2>
            <p className="mt-2 text-xs text-[#70655E]">
              Choisissez l'option qui vous convient le mieux lors de la validation de votre panier.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHIPPING_METHODS.map((method) => (
              <div
                key={method.id}
                className="bg-white p-6 rounded-2xl border border-[#E8DFD8] flex flex-col justify-between hover:border-[#9C6D49]/50 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9C6D49]">
                      {method.carrier}
                    </span>
                    <span className="text-base font-serif font-semibold text-[#2A2421]">
                      {method.price.toFixed(2)} €
                    </span>
                  </div>
                  <h3 className="font-medium text-sm text-[#2A2421] mb-1">{method.name}</h3>
                  <p className="text-xs text-[#70655E] leading-relaxed mb-3">{method.description}</p>
                </div>
                <div className="pt-3 border-t border-[#F2EBE3] text-[11px] text-[#70655E] flex items-center gap-1.5 font-medium">
                  <Truck className="w-3.5 h-3.5 text-[#9C6D49]" />
                  <span>Délai estimé : {method.estimated_days}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
