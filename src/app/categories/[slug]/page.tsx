import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CATEGORY_PAGES } from "@/data/mock-data";
import { CategoryClient } from "./CategoryClient";
import { ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_PAGES).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = CATEGORY_PAGES[slug];

  if (!config) {
    return {
      title: "Catégorie Introuvable | Club Parfum",
    };
  }

  return {
    title: `${config.title} | Club Parfum Grasse`,
    description: config.description,
    openGraph: {
      title: `${config.title} • Club Parfum`,
      description: config.description,
      images: [config.heroImage],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const config = CATEGORY_PAGES[slug];

  if (!config) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1">
        {/* Fil d'Ariane (Breadcrumb) en typographie lisible 14px */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-2 text-[14px] text-[#78716C]"
          >
            <Link href="/" className="hover:text-[#1C1917] transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
            <Link
              href="/boutique"
              className="hover:text-[#1C1917] transition-colors"
            >
              Catégories
            </Link>
            <ChevronRight className="w-4 h-4 text-[#A8A29E]" />
            <span className="text-[#1C1917] font-medium">
              {config.title.split(",")[0].trim()}
            </span>
          </nav>
        </div>

        {/* Hero Banner Editorial de Catégorie */}
        <section className="relative bg-[#F5F2EB]/70 border-y border-[#E7E2DA] py-12 sm:py-16 mb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-4">
                {config.badge && (
                  <span className="inline-block px-3 py-1 bg-white border border-[#E7E2DA] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#A16207]">
                    {config.badge}
                  </span>
                )}

                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-[#92400E]">
                    {config.subtitle}
                  </p>
                  <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] font-normal leading-[1.15] tracking-tight">
                    {config.title}
                  </h1>
                </div>

                <p className="text-base sm:text-lg text-[#44403C] leading-relaxed font-light max-w-2xl">
                  {config.description}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-lg overflow-hidden border border-[#E7E2DA] shadow-md">
                  <Image
                    src={config.heroImage}
                    alt={config.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grille et sous-catégories interactives */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <CategoryClient config={config} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
