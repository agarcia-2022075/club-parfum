import { MetadataRoute } from "next";
import { MOCK_PRODUCTS, CATEGORY_PAGES } from "@/data/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://club-parfum.fr");

  const lastModified = new Date();

  // 1. Pages statiques et institutionnelles
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/boutique`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/notre-histoire`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/livraison`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-retractation`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 2. Univers et catégories éditoriales de la Maison (/categories/[slug])
  const categoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORY_PAGES).map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Fiches de créations artisanales (/produits/[slug])
  let productSlugs: string[] = MOCK_PRODUCTS.map((p) => p.slug);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: dbProducts } = await supabase
        .from("products")
        .select("slug")
        .eq("is_active", true);

      if (dbProducts && dbProducts.length > 0) {
        const dbSlugs = dbProducts.map((p: any) => p.slug).filter(Boolean);
        productSlugs = Array.from(new Set([...productSlugs, ...dbSlugs]));
      }
    } catch (err) {
      console.warn("Sitemap: repli sur les produits locaux:", err);
    }
  }

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${baseUrl}/produits/${slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
