import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { finalizePaidOrder, getStripe, type DbPaidOrderRecord } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id")?.trim() || "";
    if (!sessionId || !sessionId.startsWith("cs_") || sessionId.length > 255) {
      return NextResponse.json(
        { error: "Identifiant de session Stripe invalide." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase manquante sur le serveur." },
        { status: 500 }
      );
    }

    const { data: initialOrder, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .maybeSingle<DbPaidOrderRecord>();

    if (error) {
      console.error("Erreur lecture verify-session:", error);
      return NextResponse.json(
        { error: "Impossible de vérifier votre commande." },
        { status: 500 }
      );
    }

    if (!initialOrder) {
      return NextResponse.json(
        { error: "Aucune commande trouvée pour cette session de paiement." },
        { status: 404 }
      );
    }

    let order = initialOrder;

    // Si le webhook a quelques millisecondes de latence, synchroniser directement via Stripe
    if (order.payment_status !== "paid") {
      const stripe = getStripe();
      if (stripe) {
        try {
          const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
          if (stripeSession.payment_status === "paid") {
            const paymentIntentId =
              typeof stripeSession.payment_intent === "string"
                ? stripeSession.payment_intent
                : stripeSession.payment_intent?.id ?? null;

            const result = await finalizePaidOrder(supabaseAdmin, order, paymentIntentId);
            order = result.order;
          }
        } catch (stripeErr) {
          console.warn("Vérification directe Stripe session ignorée:", stripeErr);
        }
      }
    }

    return NextResponse.json(
      {
        order: {
          order_number: order.order_number,
          invoice_number: order.invoice_number || null,
          payment_status: order.payment_status || "pending",
          status: order.status || "pending",
          customer_first_name: order.customer_first_name,
          customer_last_name: order.customer_last_name,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          shipping_method: order.shipping_method,
          relay_point: order.relay_point || null,
          relay_point_id: order.relay_point_id || null,
          address: order.address || null,
          postal_code: order.postal_code || "",
          city: order.city || "",
          subtotal: Number(order.subtotal || 0),
          shipping_cost: Number(order.shipping_cost || 0),
          total: Number(order.total || 0),
          items: Array.isArray(order.items) ? order.items : [],
          date: order.date,
          paid_at: order.paid_at || null,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erreur GET /api/checkout/verify-session:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de la vérification du paiement." },
      { status: 500 }
    );
  }
}
