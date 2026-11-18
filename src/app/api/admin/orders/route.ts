import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyAdminRequest } from "@/lib/admin-auth";

const ALLOWED_ORDER_STATUSES = new Set(["pending", "shipped", "delivered", "cancelled"]);

export async function GET(request: NextRequest) {
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

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lecture commandes /api/admin/orders:", error);
      return NextResponse.json(
        { error: "Impossible de charger les commandes depuis la base de données." },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders: data || [] }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur GET /api/admin/orders:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la récupération des commandes." },
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

    let body: { id?: unknown; order_number?: unknown; status?: unknown; tracking?: unknown };
    try {
      body = (await request.json()) as {
        id?: unknown;
        order_number?: unknown;
        status?: unknown;
        tracking?: unknown;
      };
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    const cleanId = typeof body.id === "string" ? body.id.trim() : "";
    const cleanOrderNumber = typeof body.order_number === "string" ? body.order_number.trim() : "";
    const cleanStatus = typeof body.status === "string" ? body.status.trim().toLowerCase() : "";
    const cleanTracking = typeof body.tracking === "string" ? body.tracking.trim().slice(0, 120) : "";

    if (!cleanId && !cleanOrderNumber) {
      return NextResponse.json(
        { error: "Identifiant ou numéro de commande requis." },
        { status: 400 }
      );
    }

    if (!ALLOWED_ORDER_STATUSES.has(cleanStatus)) {
      return NextResponse.json(
        { error: "Statut de commande invalide." },
        { status: 400 }
      );
    }

    let updatedOrder: Record<string, unknown> | null = null;

    if (cleanId) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({ status: cleanStatus, tracking: cleanTracking })
        .eq("id", cleanId)
        .select()
        .maybeSingle<Record<string, unknown>>();

      if (error) {
        console.error("Erreur mise à jour commande par id:", error);
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour de la commande." },
          { status: 500 }
        );
      }
      updatedOrder = data;
    }

    if (!updatedOrder && cleanOrderNumber) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .update({ status: cleanStatus, tracking: cleanTracking })
        .eq("order_number", cleanOrderNumber)
        .select()
        .maybeSingle<Record<string, unknown>>();

      if (error) {
        console.error("Erreur mise à jour commande par order_number:", error);
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour de la commande." },
          { status: 500 }
        );
      }
      updatedOrder = data;
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur PATCH /api/admin/orders:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la mise à jour de la commande." },
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
    let bodyOrderNumber = "";
    try {
      const parsed = (await request.json()) as { id?: unknown; order_number?: unknown };
      if (typeof parsed.id === "string") bodyId = parsed.id.trim();
      if (typeof parsed.order_number === "string") bodyOrderNumber = parsed.order_number.trim();
    } catch {
      // Le body JSON est optionnel si ?id=... est fourni en query param
    }

    const queryId = request.nextUrl.searchParams.get("id")?.trim() || "";
    const queryOrderNumber = request.nextUrl.searchParams.get("order_number")?.trim() || "";

    const cleanId = bodyId || queryId;
    const cleanOrderNumber = bodyOrderNumber || queryOrderNumber;

    if (!cleanId && !cleanOrderNumber) {
      return NextResponse.json(
        { error: "Identifiant ou numéro de commande requis pour la suppression." },
        { status: 400 }
      );
    }

    let deletedCount = 0;

    if (cleanId) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", cleanId)
        .select("id");

      if (error) {
        console.error("Erreur suppression commande par id:", error);
        return NextResponse.json(
          { error: "Impossible de supprimer cette commande." },
          { status: 500 }
        );
      }
      deletedCount = data?.length || 0;
    }

    if (deletedCount === 0 && cleanOrderNumber) {
      const { data, error } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("order_number", cleanOrderNumber)
        .select("id");

      if (error) {
        console.error("Erreur suppression commande par order_number:", error);
        return NextResponse.json(
          { error: "Impossible de supprimer cette commande." },
          { status: 500 }
        );
      }
      deletedCount = data?.length || 0;
    }

    if (deletedCount === 0) {
      return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur DELETE /api/admin/orders:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la suppression de la commande." },
      { status: 500 }
    );
  }
}
