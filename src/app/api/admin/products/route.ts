import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";
import { CATEGORIES, MOCK_PRODUCTS } from "@/data/mock-data";
import { Product, ProductVariant } from "@/types/store";

function computeBasePrice(rawBasePrice: unknown, variants: ProductVariant[]): number {
  const positivePrices = variants
    .map((v) => Number(v.price))
    .filter((p) => Number.isFinite(p) && p > 0);
  if (positivePrices.length > 0) {
    return Math.min(...positivePrices);
  }
  const fallback = Number(rawBasePrice);
  return Number.isFinite(fallback) && fallback >= 0 ? fallback : 0;
}

function normalizeVariants(
  rawVariants: unknown,
  categoryName: string,
  fallbackBasePrice: number
): ProductVariant[] {
  if (Array.isArray(rawVariants) && rawVariants.length > 0) {
    return rawVariants.map((item, idx) => {
      const v = (item && typeof item === "object" ? item : {}) as Partial<ProductVariant>;
      const price = Number(v.price);
      return {
        id: typeof v.id === "string" && v.id.trim() ? v.id.trim() : `var-${Date.now()}-${idx + 1}`,
        sku: typeof v.sku === "string" && v.sku.trim() ? v.sku.trim() : `CP-${Date.now().toString().slice(-4)}-${idx + 1}`,
        size_label:
          typeof v.size_label === "string" && v.size_label.trim()
            ? v.size_label.trim()
            : "Format Standard",
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        in_stock: typeof v.in_stock === "boolean" ? v.in_stock : true,
      };
    });
  }

  return [
    {
      id: `var-${Date.now()}`,
      sku: `CP-${Date.now().toString().slice(-4)}`,
      size_label: categoryName.toLowerCase().includes("bougie")
        ? "180 g (env. 45h de brûle)"
        : "Flacon Vaporisateur 50 ml",
      price: fallbackBasePrice,
      in_stock: true,
    },
  ];
}

function buildFinalizedProduct(raw: Partial<Product>): Product | null {
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const categoryId = typeof raw.category_id === "string" ? raw.category_id.trim() : "";
  const categoryName = typeof raw.category_name === "string" ? raw.category_name.trim() : "";

  if (!id || !name || !slug || !categoryId || !categoryName) {
    return null;
  }

  const initialPrice = Number(raw.base_price);
  const safeInitialPrice = Number.isFinite(initialPrice) && initialPrice >= 0 ? initialPrice : 0;
  const variants = normalizeVariants(raw.variants, categoryName, safeInitialPrice);
  const basePrice = computeBasePrice(safeInitialPrice, variants);

  const pyramid =
    raw.olfactory_pyramid && typeof raw.olfactory_pyramid === "object"
      ? {
          top_notes: Array.isArray(raw.olfactory_pyramid.top_notes)
            ? raw.olfactory_pyramid.top_notes.filter((n): n is string => typeof n === "string")
            : [],
          heart_notes: Array.isArray(raw.olfactory_pyramid.heart_notes)
            ? raw.olfactory_pyramid.heart_notes.filter((n): n is string => typeof n === "string")
            : [],
          base_notes: Array.isArray(raw.olfactory_pyramid.base_notes)
            ? raw.olfactory_pyramid.base_notes.filter((n): n is string => typeof n === "string")
            : [],
        }
      : { top_notes: [], heart_notes: [], base_notes: [] };

  return {
    id,
    category_id: categoryId,
    category_name: categoryName,
    name,
    slug,
    description: typeof raw.description === "string" ? raw.description : "",
    scent_notes: Array.isArray(raw.scent_notes)
      ? raw.scent_notes.filter((n): n is string => typeof n === "string")
      : [],
    olfactory_family:
      typeof raw.olfactory_family === "string" && raw.olfactory_family.trim()
        ? raw.olfactory_family.trim()
        : "Orientale",
    facets: typeof raw.facets === "string" ? raw.facets : "",
    olfactory_pyramid: pyramid,
    concentration_info:
      typeof raw.concentration_info === "string" && raw.concentration_info.trim()
        ? raw.concentration_info.trim()
        : undefined,
    base_price: basePrice,
    images: Array.isArray(raw.images)
      ? raw.images.filter((img): img is string => typeof img === "string" && img.trim().length > 0)
      : [],
    is_active: typeof raw.is_active === "boolean" ? raw.is_active : true,
    featured: typeof raw.featured === "boolean" ? raw.featured : false,
    variants,
  };
}

export async function POST(request: NextRequest) {
  try {
    const adminSession = verifyAdminRequest(request);
    if (!adminSession) {
      return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase d'administration manquante sur le serveur." },
        { status: 500 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    // --- ACTION RESET : Restauration des 8 créations officielles de Grasse ---
    if (body.action === "reset") {
      const officialIds = MOCK_PRODUCTS.map((p) => p.id);

      const { error: catUpsertError } = await supabaseAdmin
        .from("categories")
        .upsert(CATEGORIES, { onConflict: "id" });

      if (catUpsertError) {
        console.error("Erreur restauration catégories:", catUpsertError);
        return NextResponse.json(
          { error: "Impossible de restaurer les catégories officielles." },
          { status: 500 }
        );
      }

      const { data: existingProducts, error: listError } = await supabaseAdmin
        .from("products")
        .select("id");

      if (listError) {
        console.error("Erreur lecture produits lors du reset:", listError);
        return NextResponse.json(
          { error: "Impossible de lire les produits existants." },
          { status: 500 }
        );
      }

      const extraIds = (existingProducts || [])
        .map((row: { id: string }) => row.id)
        .filter((id) => !officialIds.includes(id));

      if (extraIds.length > 0) {
        const { error: deleteExtraError } = await supabaseAdmin
          .from("products")
          .delete()
          .in("id", extraIds);

        if (deleteExtraError) {
          console.error("Erreur suppression produits additionnels:", deleteExtraError);
          return NextResponse.json(
            { error: "Impossible de supprimer les créations additionnelles." },
            { status: 500 }
          );
        }
      }

      const nowIso = new Date().toISOString();
      const officialRows = MOCK_PRODUCTS.map((p) => ({
        id: p.id,
        category_id: p.category_id,
        category_name: p.category_name,
        name: p.name,
        slug: p.slug,
        description: p.description,
        scent_notes: p.scent_notes,
        olfactory_family: p.olfactory_family,
        facets: p.facets,
        olfactory_pyramid: p.olfactory_pyramid,
        concentration_info: p.concentration_info ?? null,
        base_price: p.base_price,
        images: p.images,
        is_active: true,
        featured: Boolean(p.featured),
        updated_at: nowIso,
      }));

      const { error: upsertProdError } = await supabaseAdmin
        .from("products")
        .upsert(officialRows, { onConflict: "id" });

      if (upsertProdError) {
        console.error("Erreur restauration produits officiels:", upsertProdError);
        return NextResponse.json(
          { error: "Impossible de restaurer les produits officiels." },
          { status: 500 }
        );
      }

      const { error: deleteVarError } = await supabaseAdmin
        .from("product_variants")
        .delete()
        .in("product_id", officialIds);

      if (deleteVarError) {
        console.error("Erreur nettoyage variantes lors du reset:", deleteVarError);
        return NextResponse.json(
          { error: "Impossible de réinitialiser les formats." },
          { status: 500 }
        );
      }

      const officialVariants = MOCK_PRODUCTS.flatMap((p) =>
        (p.variants || []).map((v) => ({
          id: v.id,
          product_id: p.id,
          sku: v.sku,
          size_label: v.size_label,
          price: Number(v.price),
          in_stock: true,
        }))
      );

      if (officialVariants.length > 0) {
        const { error: insertVarError } = await supabaseAdmin
          .from("product_variants")
          .insert(officialVariants);

        if (insertVarError) {
          console.error("Erreur restauration variantes officielles:", insertVarError);
          return NextResponse.json(
            { error: "Impossible de restaurer les variantes officielles." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true, products: MOCK_PRODUCTS }, { status: 200 });
    }

    // --- CRÉATION D'UN PRODUIT ---
    const rawProduct = (body.product && typeof body.product === "object"
      ? body.product
      : body) as Partial<Product>;
    const product = buildFinalizedProduct(rawProduct);

    if (!product) {
      return NextResponse.json(
        { error: "Données produit incomplètes (id, nom, slug et catégorie requis)." },
        { status: 400 }
      );
    }

    const { error: prodError } = await supabaseAdmin.from("products").insert({
      id: product.id,
      category_id: product.category_id,
      category_name: product.category_name,
      name: product.name,
      slug: product.slug,
      description: product.description,
      scent_notes: product.scent_notes,
      olfactory_family: product.olfactory_family,
      facets: product.facets,
      olfactory_pyramid: product.olfactory_pyramid,
      concentration_info: product.concentration_info ?? null,
      base_price: product.base_price,
      images: product.images,
      is_active: product.is_active,
      featured: Boolean(product.featured),
    });

    if (prodError) {
      console.error("Erreur insertion produit Supabase:", prodError);
      if (prodError.code === "23505") {
        return NextResponse.json(
          { error: "Un produit avec ce slug ou cet identifiant existe déjà." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Impossible de créer le produit : ${prodError.message}` },
        { status: 500 }
      );
    }

    const variantsData = (product.variants || []).map((v) => ({
      id: v.id,
      product_id: product.id,
      sku: v.sku,
      size_label: v.size_label,
      price: Number(v.price),
      in_stock: v.in_stock ?? true,
    }));

    if (variantsData.length > 0) {
      const { error: varError } = await supabaseAdmin.from("product_variants").insert(variantsData);
      if (varError) {
        console.error("Erreur insertion variantes Supabase:", varError);
        await supabaseAdmin.from("products").delete().eq("id", product.id);
        return NextResponse.json(
          { error: `Impossible d'enregistrer les formats du produit : ${varError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: unknown) {
    console.error("Erreur POST /api/admin/products:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'enregistrement du produit." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminSession = verifyAdminRequest(request);
    if (!adminSession) {
      return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase d'administration manquante sur le serveur." },
        { status: 500 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    // --- TOGGLE STOCK PRODUIT ---
    if (body.action === "toggleStock") {
      const productId = typeof body.productId === "string" ? body.productId.trim() : "";
      const isActive = body.is_active;

      if (!productId || typeof isActive !== "boolean") {
        return NextResponse.json(
          { error: "Paramètres productId et is_active requis." },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("products")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", productId)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Erreur toggleStock Supabase:", error);
        return NextResponse.json(
          { error: "Impossible de modifier l'état de disponibilité du produit." },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
      }

      return NextResponse.json({ success: true, productId, is_active: isActive }, { status: 200 });
    }

    // --- TOGGLE STOCK VARIANTE ---
    if (body.action === "toggleVariantStock") {
      const variantId = typeof body.variantId === "string" ? body.variantId.trim() : "";
      const inStock = body.in_stock;

      if (!variantId || typeof inStock !== "boolean") {
        return NextResponse.json(
          { error: "Paramètres variantId et in_stock requis." },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("product_variants")
        .update({ in_stock: inStock })
        .eq("id", variantId)
        .select("id")
        .maybeSingle();

      if (error) {
        console.error("Erreur toggleVariantStock Supabase:", error);
        return NextResponse.json(
          { error: "Impossible de modifier le stock de ce format." },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json({ error: "Format introuvable." }, { status: 404 });
      }

      return NextResponse.json({ success: true, variantId, in_stock: inStock }, { status: 200 });
    }

    // --- MISE À JOUR COMPLÈTE DU PRODUIT & RÉCONCILIATION DES VARIANTES ---
    const rawProduct = (body.product && typeof body.product === "object"
      ? body.product
      : body) as Partial<Product>;
    const product = buildFinalizedProduct(rawProduct);

    if (!product) {
      return NextResponse.json(
        { error: "Données produit invalides pour la mise à jour." },
        { status: 400 }
      );
    }

    const { data: updatedProd, error: prodError } = await supabaseAdmin
      .from("products")
      .update({
        category_id: product.category_id,
        category_name: product.category_name,
        name: product.name,
        slug: product.slug,
        description: product.description,
        scent_notes: product.scent_notes,
        olfactory_family: product.olfactory_family,
        facets: product.facets,
        olfactory_pyramid: product.olfactory_pyramid,
        concentration_info: product.concentration_info ?? null,
        base_price: product.base_price,
        images: product.images,
        is_active: product.is_active,
        featured: Boolean(product.featured),
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id)
      .select("id")
      .maybeSingle();

    if (prodError) {
      console.error("Erreur mise à jour produit Supabase:", prodError);
      if (prodError.code === "23505") {
        return NextResponse.json(
          { error: "Un autre produit utilise déjà ce slug." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: `Impossible de mettre à jour le produit : ${prodError.message}` },
        { status: 500 }
      );
    }

    if (!updatedProd) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    const { error: deleteVarError } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("product_id", product.id);

    if (deleteVarError) {
      console.error("Erreur suppression anciennes variantes:", deleteVarError);
      return NextResponse.json(
        { error: "Impossible de réconcilier les formats existants." },
        { status: 500 }
      );
    }

    const variantsData = (product.variants || []).map((v) => ({
      id: v.id,
      product_id: product.id,
      sku: v.sku,
      size_label: v.size_label,
      price: Number(v.price),
      in_stock: v.in_stock ?? true,
    }));

    if (variantsData.length > 0) {
      const { error: insertVarError } = await supabaseAdmin
        .from("product_variants")
        .insert(variantsData);

      if (insertVarError) {
        console.error("Erreur réinsertion variantes:", insertVarError);
        return NextResponse.json(
          { error: `Erreur lors de l'enregistrement des formats : ${insertVarError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur PATCH /api/admin/products:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la mise à jour du produit." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminSession = verifyAdminRequest(request);
    if (!adminSession) {
      return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase d'administration manquante sur le serveur." },
        { status: 500 }
      );
    }

    let bodyId = "";
    try {
      const parsed = (await request.json()) as { id?: unknown };
      if (typeof parsed.id === "string") bodyId = parsed.id.trim();
    } catch {
      // Optionnel si ?id=... est fourni en query param
    }

    const queryId = request.nextUrl.searchParams.get("id")?.trim() || "";
    const cleanId = bodyId || queryId;

    if (!cleanId) {
      return NextResponse.json({ error: "Identifiant produit requis." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", cleanId)
      .select("id");

    if (error) {
      console.error("Erreur suppression produit Supabase:", error);
      return NextResponse.json(
        { error: "Impossible de supprimer ce produit." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur DELETE /api/admin/products:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la suppression du produit." },
      { status: 500 }
    );
  }
}
