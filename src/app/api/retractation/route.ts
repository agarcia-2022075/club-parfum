import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClientIp } from "@/lib/admin-auth";
import { sendWithdrawalConfirmationEmails } from "@/lib/email";

const MAX_REQUESTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const withdrawalRateLimitByIp = new Map<string, RateLimitEntry>();

function checkWithdrawalRateLimit(
  ip: string,
  now: number
): { allowed: boolean; retryAfterSeconds: number } {
  if (withdrawalRateLimitByIp.size > 500) {
    for (const [key, entry] of withdrawalRateLimitByIp.entries()) {
      if (now >= entry.resetAt) {
        withdrawalRateLimitByIp.delete(key);
      }
    }
  }

  const existing = withdrawalRateLimitByIp.get(ip);
  if (!existing || now >= existing.resetAt) {
    withdrawalRateLimitByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

function sanitizeField(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const now = Date.now();
    const clientIp = getClientIp(request);
    const rateCheck = checkWithdrawalRateLimit(clientIp, now);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Trop de demandes transmises récemment. Veuillez patienter quelques minutes avant de réessayer.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service temporairement indisponible. Veuillez réessayer ultérieurement." },
        { status: 500 }
      );
    }

    let body: {
      orderNumber?: unknown;
      customerName?: unknown;
      customerEmail?: unknown;
      reason?: unknown;
    };
    try {
      body = (await request.json()) as {
        orderNumber?: unknown;
        customerName?: unknown;
        customerEmail?: unknown;
        reason?: unknown;
      };
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    const orderNumber = sanitizeField(body.orderNumber, 64);
    const customerName = sanitizeField(body.customerName, 120);
    const customerEmail = sanitizeField(body.customerEmail, 120).toLowerCase();
    const reason = sanitizeField(body.reason, 1000);

    if (!orderNumber || !customerName) {
      return NextResponse.json(
        { error: "Veuillez indiquer votre numéro de commande ainsi que votre nom complet." },
        { status: 400 }
      );
    }

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return NextResponse.json(
        { error: "Veuillez renseigner une adresse e-mail valide." },
        { status: 400 }
      );
    }

    // Recherche de la commande correspondante (insensible à la casse) pour lier order_id et vérifier l'e-mail
    const escapedOrderNumber = orderNumber.replace(/[\\%_]/g, "\\$&");
    const { data: candidateOrders, error: orderLookupError } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, customer_email")
      .ilike("order_number", escapedOrderNumber)
      .limit(5);

    if (orderLookupError) {
      console.error("Erreur recherche commande pour rétractation:", orderLookupError);
      return NextResponse.json(
        { error: "Impossible de vérifier votre commande actuellement." },
        { status: 500 }
      );
    }

    const matchedOrder = (candidateOrders || []).find(
      (o) =>
        typeof o.order_number === "string" &&
        o.order_number.trim().toLowerCase() === orderNumber.toLowerCase()
    );

    if (matchedOrder) {
      const orderEmail = (matchedOrder.customer_email || "").trim().toLowerCase();
      if (orderEmail !== customerEmail) {
        return NextResponse.json(
          { error: "L'adresse e-mail renseignée ne correspond pas à cette commande." },
          { status: 400 }
        );
      }
    }

    const year = new Date().getFullYear();
    const reference = `RET-${year}-${Date.now().toString().slice(-6)}`;
    const id = `ret-${Date.now()}`;

    const { error: insertError } = await supabaseAdmin.from("withdrawal_requests").insert({
      id,
      reference,
      order_id: matchedOrder ? matchedOrder.id : null,
      order_number: orderNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      reason,
      status: "received",
    });

    if (insertError) {
      console.error("Erreur enregistrement withdrawal_requests:", insertError);
      return NextResponse.json(
        { error: "Impossible d'enregistrer votre demande de rétractation actuellement." },
        { status: 500 }
      );
    }

    let emailSent = false;
    try {
      const emailRes = await sendWithdrawalConfirmationEmails({
        reference,
        orderNumber,
        customerName,
        customerEmail,
        reason,
      });
      emailSent = emailRes.sent;
    } catch (err) {
      console.warn("Avertissement envoi e-mail rétractation:", err);
    }

    return NextResponse.json(
      {
        success: true,
        reference,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur inattendue POST /api/retractation:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de l'envoi de votre demande." },
      { status: 500 }
    );
  }
}
