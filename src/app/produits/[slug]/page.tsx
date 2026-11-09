import Link from "next/link";
import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/data/mock-data";
import { Product } from "@/types/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Truck, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { ProductDetailClient } from "./ProductDetailClient";

export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

/**
 * Récupère le produit par son slug en interrogeant d'abord Supabase en temps réel.
 * En cas d'indisponibilité ou si le produit n'existe pas en base distante,
 * effectue un repli automatique sur les produits MOCK locaux.
 */
async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  // 1. Recherche prioritaire dans Supabase (Live Database)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          category_id: data.category_id,
          category_name: data.category_name,
          name: data.name,
          slug: data.slug,
          description: data.description,
          scent_notes: data.scent_notes || [],
          olfactory_family: data.olfactory_family,
          facets: data.facets,
          olfactory_pyramid: data.olfactory_pyramid || {
            top_notes: [],
            heart_notes: [],
            base_notes: [],
          },
          concentration_info: data.concentration_info,
          base_price: Number(data.base_price),
          images:
            Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800"],
          is_active: data.is_active ?? true,
          featured: data.featured ?? false,
          variants: Array.isArray(data.product_variants)
            ? data.product_variants.map((v: any) => ({
                id: v.id,
                sku: v.sku,
                size_label: v.size_label,
                price: Number(v.price),
                in_stock: v.in_stock ?? true,
              }))
            : [],
        };
      }
    } catch (err) {
      console.warn("Échec récupération produit Supabase par slug, repli sur mock:", err);
    }
  }

  // 2. Repli de secours sur MOCK_PRODUCTS
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Produit non trouvé | Club Parfum",
    };
  }

  return {
    title: `${product.name} • ${product.category_name}`,
    description: `${product.description} Pyramide olfactive: ${(product.scent_notes || []).join(", ")}. Livraison offerte dès 60 €.`,
    openGraph: {
      title: `${product.name} | Club Parfum Grasse`,
      description: product.description,
      images: product.images,
      type: "article",
      locale: "fr_FR",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  // Produits suggérés "Vous aimerez aussi" (même catégorie ou famille olfactive, hors produit actuel)
  const relatedProducts = product
    ? MOCK_PRODUCTS.filter(
        (p) =>
          p.slug !== product.slug &&
          (p.category_id === product.category_id || p.olfactory_family === product.olfactory_family)
      ).slice(0, 3)
    : [];

  const finalRelated = product
    ? relatedProducts.length === 3
      ? relatedProducts
      : [
          ...relatedProducts,
          ...MOCK_PRODUCTS.filter((p) => p.slug !== product.slug && !relatedProducts.includes(p)),
        ].slice(0, 3)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Fil d'Ariane (Breadcrumb) */}
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-sm text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/boutique" className="hover:text-[#1C1917] transition-colors">
            Boutique
          </Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium truncate max-w-[200px] sm:max-w-none">
            {product?.name || "Détail de la création"}
          </span>
        </nav>

        {/* Composant interactif Client (Gère le produit Supabase/Mock ou résout depuis CatalogContext) */}
        <ProductDetailClient product={product || null} slug={slug} />

        {/* Section Reassurance Spécifique au produit (Livraison & Engagement) */}
        {product && (
          <section className="mt-20 pt-12 border-t border-[#E7E2DA] grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-[#57534E]">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E7E2DA]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207] shrink-0">
                <Truck className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-[15px] text-[#1C1917] mb-1">Livraison en France</h4>
                <p className="leading-relaxed">
                  Point Relais dès 4,50 € ou à domicile par Colissimo sous 48h. Offerte dès 60 € d&apos;achat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E7E2DA]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207] shrink-0">
                <Sparkles className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-[15px] text-[#1C1917] mb-1">Concentré de Grasse</h4>
                <p className="leading-relaxed">
                  Essences nobles sans additifs controversés. Bougies 100% cire végétale sans paraffine.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-white border border-[#E7E2DA]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-[15px] text-[#1C1917] mb-1">Paiement & Conseil</h4>
                <p className="leading-relaxed">
                  Règlement chiffré SSL. Conseil olfactif personnalisé disponible sur WhatsApp.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SECTION "VOUS AIMEREZ AUSSI" (Produits Similaires Recommandés) */}
        {product && finalRelated.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#E7E2DA]">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs uppercase tracking-[0.28em] text-[#A16207] font-semibold block mb-2">
                  Harmonies Olfactives
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
                  Vous aimerez aussi
                </h2>
              </div>
              <Link
                href="/boutique"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A16207] hover:text-[#1C1917] flex items-center gap-1.5 transition-colors group"
              >
                <span>Explorer tout le catalogue</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {finalRelated.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
