import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MOCK_PRODUCTS } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Check, ShoppingBag, Truck, ShieldCheck, Sparkles, MessageCircle } from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Fil d'Ariane (Breadcrumb) */}
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-xs text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">Accueil</Link>
          <span>/</span>
          <Link href="/boutique" className="hover:text-[#1C1917] transition-colors">Boutique</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Composant interactif Client (Sélection de formats, prix dynamique, ajout au panier) */}
        <ProductDetailClient product={product} />

        {/* Section Reassurance Spécifique au produit (Livraison & Engagement) */}
        <section className="mt-20 pt-12 border-t border-[#E7E2DA] grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-[#57534E]">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E7E2DA]">
            <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207] shrink-0">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1C1917] mb-1">Livraison en France</h4>
              <p className="leading-relaxed">Disponible en Point Relais dès 4,50 € ou à domicile par Colissimo sous 48h à 72h.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E7E2DA]">
            <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207] shrink-0">
              <Sparkles className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1C1917] mb-1">Concentré de Grasse</h4>
              <p className="leading-relaxed">Parfums développés avec des maîtres parfumeurs. Cires 100% végétales sans paraffine.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E7E2DA]">
            <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207] shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-[#1C1917] mb-1">Paiement & Conseil</h4>
              <p className="leading-relaxed">Règlement sécurisé (CB, Apple Pay, PayPal). Besoin d'un conseil ? Contactez-nous par WhatsApp.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
