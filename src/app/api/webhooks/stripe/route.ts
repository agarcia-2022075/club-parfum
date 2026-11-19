import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { finalizePaidOrder, getStripe, type DbPaidOrderRecord } from "@/lib/stripe";

async function findOrderForSession(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  session: Stripe.Checkout.Session
): Promise<DbPaidOrderRecord | null> {
  const { data: bySession } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("stripe_session_id", session.id)
    .maybeSingle<DbPaidOrderRecord>();

  if (bySession) {
    return bySession;
  }

  const orderId = session.metadata?.order_id;
  if (orderId) {
    const { data: byId } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle<DbPaidOrderRecord>();
    return byId ?? null;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";

    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: "Configuration Stripe Webhook manquante sur le serveur." },
        { status: 503 }
      );
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json({ error: "Signature Stripe manquante." }, { status: 400 });
    }

    const rawBody = await request.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signature invalide";
      console.error("Échec vérification signature webhook Stripe:", msg);
      return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase manquante sur le serveur." },
        { status: 500 }
      );
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const order = await findOrderForSession(supabaseAdmin, session);
      if (!order) {
        console.warn(`Webhook Stripe: aucune commande trouvée pour session ${session.id}`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      await finalizePaidOrder(supabaseAdmin, order, paymentIntentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const order = await findOrderForSession(supabaseAdmin, session);
      if (order && order.payment_status !== "paid") {
        const nextPaymentStatus =
          event.type === "checkout.session.expired" ? "expired" : "failed";
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: nextPaymentStatus,
            status: "cancelled",
          })
          .eq("id", order.id)
          .neq("payment_status", "paid");
      }
      return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Erreur inattendue POST /api/webhooks/stripe:", error);
    return NextResponse.json(
      { error: "Erreur interne lors du traitement du webhook Stripe." },
      { status: 500 }
    );
  }
}
