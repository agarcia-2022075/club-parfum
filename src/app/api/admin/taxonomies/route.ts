import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

    const type = body.type;

    if (type === "category") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const rawSlug = typeof body.slug === "string" ? body.slug.trim() : "";
      const slug = rawSlug ? slugify(rawSlug) : slugify(name);
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const id =
        typeof body.id === "string" && body.id.trim() ? body.id.trim() : `cat-${Date.now()}`;

      if (!name || !slug) {
        return NextResponse.json(
          { error: "Le nom et le slug de la catégorie sont requis." },
          { status: 400 }
        );
      }

      const category = { id, name, slug, description };
      const { error } = await supabaseAdmin.from("categories").insert(category);

      if (error) {
        console.error("Erreur insertion catégorie Supabase:", error);
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Une catégorie avec ce slug existe déjà." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `Impossible d'ajouter la catégorie : ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, category }, { status: 201 });
    }

    if (type === "family") {
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const moodRaw = typeof body.mood === "string" ? body.mood.trim() : "";
      const mood = moodRaw || "Accord Signature de Grasse";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const id =
        typeof body.id === "string" && body.id.trim() ? body.id.trim() : `fam-${Date.now()}`;

      if (!name) {
        return NextResponse.json(
          { error: "Le nom de la famille olfactive est requis." },
          { status: 400 }
        );
      }

      const family = { id, name, mood, description };
      const { error } = await supabaseAdmin.from("olfactory_families").insert(family);

      if (error) {
        console.error("Erreur insertion famille olfactive Supabase:", error);
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Cette famille olfactive existe déjà." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `Impossible d'ajouter la famille olfactive : ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, family }, { status: 201 });
    }

    return NextResponse.json({ error: "Type de taxonomie invalide." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Erreur POST /api/admin/taxonomies:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la création de la taxonomie." },
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

    const type = body.type;

    if (type === "category") {
      const id = typeof body.id === "string" ? body.id.trim() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const rawSlug = typeof body.slug === "string" ? body.slug.trim() : "";
      const slug = rawSlug ? slugify(rawSlug) : slugify(name);
      const description = typeof body.description === "string" ? body.description.trim() : "";

      if (!id || !name || !slug) {
        return NextResponse.json(
          { error: "Identifiant, nom et slug de catégorie requis." },
          { status: 400 }
        );
      }

      const { data: updatedCat, error: catError } = await supabaseAdmin
        .from("categories")
        .update({ name, slug, description })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (catError) {
        console.error("Erreur mise à jour catégorie Supabase:", catError);
        if (catError.code === "23505") {
          return NextResponse.json(
            { error: "Une autre catégorie utilise déjà ce slug." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `Impossible de modifier la catégorie : ${catError.message}` },
          { status: 500 }
        );
      }

      if (!updatedCat) {
        return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
      }

      const { error: prodUpdateError } = await supabaseAdmin
        .from("products")
        .update({ category_name: name, updated_at: new Date().toISOString() })
        .eq("category_id", id);

      if (prodUpdateError) {
        console.error("Erreur propagation nom de catégorie aux produits:", prodUpdateError);
        return NextResponse.json(
          { error: "Catégorie modifiée, mais échec de propagation aux produits." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, category: { id, name, slug, description } },
        { status: 200 }
      );
    }

    if (type === "family") {
      const id = typeof body.id === "string" ? body.id.trim() : "";
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const moodRaw = typeof body.mood === "string" ? body.mood.trim() : "";
      const mood = moodRaw || "Accord Signature de Grasse";
      const description = typeof body.description === "string" ? body.description.trim() : "";
      const oldName = typeof body.oldName === "string" ? body.oldName.trim() : "";

      if (!id || !name) {
        return NextResponse.json(
          { error: "Identifiant et nom de la famille olfactive requis." },
          { status: 400 }
        );
      }

      const { data: updatedFam, error: famError } = await supabaseAdmin
        .from("olfactory_families")
        .update({ name, mood, description })
        .eq("id", id)
        .select()
        .maybeSingle();

      if (famError) {
        console.error("Erreur mise à jour famille olfactive Supabase:", famError);
        if (famError.code === "23505") {
          return NextResponse.json(
            { error: "Une autre famille olfactive porte déjà ce nom." },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `Impossible de modifier la famille olfactive : ${famError.message}` },
          { status: 500 }
        );
      }

      if (!updatedFam) {
        return NextResponse.json({ error: "Famille olfactive introuvable." }, { status: 404 });
      }

      if (oldName && oldName !== name) {
        const { error: prodUpdateError } = await supabaseAdmin
          .from("products")
          .update({ olfactory_family: name, updated_at: new Date().toISOString() })
          .eq("olfactory_family", oldName);

        if (prodUpdateError) {
          console.error("Erreur propagation famille olfactive aux produits:", prodUpdateError);
          return NextResponse.json(
            { error: "Famille modifiée, mais échec de propagation aux produits." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        { success: true, family: { id, name, mood, description } },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Type de taxonomie invalide." }, { status: 400 });
  } catch (error: unknown) {
    console.error("Erreur PATCH /api/admin/taxonomies:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la modification de la taxonomie." },
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

    let bodyType = "";
    let bodyId = "";
    try {
      const parsed = (await request.json()) as { type?: unknown; id?: unknown };
      if (typeof parsed.type === "string") bodyType = parsed.type.trim();
      if (typeof parsed.id === "string") bodyId = parsed.id.trim();
    } catch {
      // Optionnel si query params fournis
    }

    const type = bodyType || request.nextUrl.searchParams.get("type")?.trim() || "";
    const id = bodyId || request.nextUrl.searchParams.get("id")?.trim() || "";

    if (!id || (type !== "category" && type !== "family")) {
      return NextResponse.json(
        { error: "Type ('category' ou 'family') et identifiant requis." },
        { status: 400 }
      );
    }

    if (type === "category") {
      const { count, error: countError } = await supabaseAdmin
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id);

      if (countError) {
        console.error("Erreur vérification produits liés à la catégorie:", countError);
        return NextResponse.json(
          { error: "Impossible de vérifier les produits associés à cette catégorie." },
          { status: 500 }
        );
      }

      if ((count ?? 0) > 0) {
        return NextResponse.json(
          {
            error: `Impossible de supprimer cette catégorie : ${count} produit(s) y sont encore rattachés.`,
          },
          { status: 409 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("categories")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        console.error("Erreur suppression catégorie Supabase:", error);
        return NextResponse.json(
          { error: "Impossible de supprimer cette catégorie." },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from("olfactory_families")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Erreur suppression famille olfactive Supabase:", error);
      return NextResponse.json(
        { error: "Impossible de supprimer cette famille olfactive." },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Famille olfactive introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur DELETE /api/admin/taxonomies:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la suppression de la taxonomie." },
      { status: 500 }
    );
  }
}
