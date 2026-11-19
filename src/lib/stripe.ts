import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  sendAdminNewOrderEmail,
  sendOrderConfirmationEmail,
  type EmailOrderData,
} from "@/lib/email";

let stripeInstance: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() || "";
  if (!secretKey) {
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey);
  }

  return stripeInstance;
}

export interface DbPaidOrderRecord extends EmailOrderData {
  id: string;
  payment_status?: string | null;
  payment_gateway?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  status?: string | null;
}

export async function finalizePaidOrder(
  supabaseAdmin: SupabaseClient,
  order: DbPaidOrderRecord,
  paymentIntentId: string | null
): Promise<{ order: DbPaidOrderRecord; newlyPaid: boolean }> {
  if (order.payment_status === "paid") {
    return { order, newlyPaid: false };
  }

  let invoiceNumber = order.invoice_number || null;
  if (!invoiceNumber) {
    try {
      const { data: rpcInvoice, error: rpcError } = await supabaseAdmin.rpc(
        "next_invoice_number"
      );
      if (!rpcError && typeof rpcInvoice === "string" && rpcInvoice.trim()) {
        invoiceNumber = rpcInvoice.trim();
      }
    } catch (err) {
      console.warn("Repli génération numéro de facture (RPC indisponible):", err);
    }

    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      invoiceNumber = `FA-${year}-${Date.now().toString().slice(-6)}`;
    }
  }

  const paidAtIso = new Date().toISOString();

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      status: "pending",
      stripe_payment_intent_id: paymentIntentId,
      invoice_number: invoiceNumber,
      paid_at: paidAtIso,
    })
    .eq("id", order.id)
    .neq("payment_status", "paid")
    .select("*")
    .maybeSingle<DbPaidOrderRecord>();

  if (updateError) {
    console.error("Erreur mise à jour paiement commande:", updateError);
    throw new Error("Impossible de finaliser le paiement de la commande.");
  }

  if (!updatedOrder) {
    const { data: refreshed } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order.id)
      .maybeSingle<DbPaidOrderRecord>();
    return { order: refreshed || order, newlyPaid: false };
  }

  // Décrément atomique du stock par variante
  const items = Array.isArray(updatedOrder.items) ? updatedOrder.items : [];
  for (const item of items) {
    if (item && typeof item.variant_id === "string" && item.variant_id.trim()) {
      const qty = Math.max(1, Math.floor(Number(item.qty || 1)));
      try {
        const { error: stockError } = await supabaseAdmin.rpc("decrement_variant_stock", {
          p_variant_id: item.variant_id.trim(),
          p_qty: qty,
        });
        if (stockError) {
          console.warn(
            `Avertissement décrément stock pour variante ${item.variant_id}:`,
            stockError.message
          );
        }
      } catch (err) {
        console.warn(`Exception décrément stock pour variante ${item.variant_id}:`, err);
      }
    }
  }

  // Envoi des e-mails transactionnels (sans jamais bloquer la réponse 200 du webhook)
  try {
    await Promise.allSettled([
      sendOrderConfirmationEmail(updatedOrder),
      sendAdminNewOrderEmail(updatedOrder),
    ]);
  } catch (err) {
    console.warn("Avertissement envoi e-mails post-paiement:", err);
  }

  return { order: updatedOrder, newlyPaid: true };
}
