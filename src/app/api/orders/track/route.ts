import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClientIp } from "@/lib/admin-auth";

const MAX_TRACK_QUERIES = 15;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const trackRateLimitByIp = new Map<string, RateLimitEntry>();

function checkTrackRateLimit(ip: string, now: number): { allowed: boolean; retryAfterSeconds: number } {
  if (trackRateLimitByIp.size > 500) {
    for (const [key, entry] of trackRateLimitByIp.entries()) {
      if (now >= entry.resetAt) {
        trackRateLimitByIp.delete(key);
      }
    }
  }

  const existing = trackRateLimitByIp.get(ip);
  if (!existing || now >= existing.resetAt) {
    trackRateLimitByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_TRACK_QUERIES) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

interface SafeOrderRow {
  id: string;
  order_number: string;
  date: string;
  customer_first_name: string | null;
  status: string;
  tracking: string | null;
  shipping_method: string;
  shipping_cost: number | string;
  subtotal: number | string;
  total: number | string;
  items: unknown;
  postal_code: string | null;
  city: string | null;
  relay_point: string | null;
  created_at: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const now = Date.now();
    const clientIp = getClientIp(request);
    const rateCheck = checkTrackRateLimit(clientIp, now);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Trop de recherches effectuées. Pour votre sécurité, veuillez patienter quelques minutes avant de réessayer.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    let body: { orderNumber?: unknown; email?: unknown };
    try {
      body = (await request.json()) as { orderNumber?: unknown; email?: unknown };
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    const rawOrderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!rawOrderNumber || !rawEmail) {
      return NextResponse.json(
        { error: "Veuillez renseigner le numéro de commande et l'adresse e-mail." },
        { status: 400 }
      );
    }

    if (rawOrderNumber.length > 64 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return NextResponse.json(
        { error: "Format du numéro de commande ou de l'adresse e-mail invalide." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Le serveur de suivi est temporairement indisponible." },
        { status: 500 }
      );
    }

    const escapedOrderNumber = escapeIlikePattern(rawOrderNumber);
    const escapedEmail = escapeIlikePattern(rawEmail);

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, date, customer_first_name, status, tracking, shipping_method, shipping_cost, subtotal, total, items, postal_code, city, relay_point, created_at"
      )
      .ilike("order_number", escapedOrderNumber)
      .ilike("customer_email", escapedEmail)
      .maybeSingle<SafeOrderRow>();

    if (error) {
      console.error("Erreur recherche suivi commande /api/orders/track:", error);
      return NextResponse.json(
        { error: "Impossible de consulter le suivi pour le moment." },
        { status: 500 }
      );
    }

    if (!data || data.order_number.toLowerCase() !== rawOrderNumber.toLowerCase()) {
      return NextResponse.json(
        { error: "Aucune commande ne correspond à ce numéro et à cette adresse e-mail." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        order: {
          id: data.id,
          order_number: data.order_number,
          date: data.date,
          customer_first_name: data.customer_first_name || "",
          status: data.status || "pending",
          tracking: data.tracking || "",
          shipping_method: data.shipping_method,
          shipping_cost: Number(data.shipping_cost || 0),
          subtotal: Number(data.subtotal || 0),
          total: Number(data.total || 0),
          items: Array.isArray(data.items) ? data.items : [],
          postal_code: data.postal_code || "",
          city: data.city || "",
          relay_point: data.relay_point || null,
          created_at: data.created_at || undefined,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erreur inattendue dans /api/orders/track:", error);
    return NextResponse.json(
      { error: "Erreur réseau lors de la recherche de votre commande." },
      { status: 500 }
    );
  }
}
