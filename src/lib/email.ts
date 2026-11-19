import { Resend } from "resend";
import { STORE_CONFIG, escapeHtmlText, getLegalFieldOrFallback } from "@/lib/store-config";
import type { OrderItem } from "@/types/store";

export interface EmailOrderData {
  id: string;
  order_number: string;
  invoice_number?: string | null;
  date: string;
  paid_at?: string | null;
  customer_first_name: string;
  customer_last_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_method: string;
  shipping_cost: number | string;
  relay_point?: string | null;
  relay_point_id?: string | null;
  address?: string | null;
  building?: string | null;
  digicode?: string | null;
  postal_code?: string | null;
  city?: string | null;
  subtotal: number | string;
  total: number | string;
  tracking?: string | null;
  items: OrderItem[];
}

export interface WithdrawalEmailData {
  reference: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason?: string;
}

export interface EmailSendResult {
  sent: boolean;
  skipped?: boolean;
  error?: string;
}

let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  if (!apiKey) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

function getFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `${STORE_CONFIG.brandName} • Grasse <commandes@clubparfum.fr>`
  );
}

function getAdminRecipients(): string[] {
  const raw = (
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    STORE_CONFIG.contactEmail
  ).trim();

  const list = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return list.length > 0 ? list : [STORE_CONFIG.contactEmail];
}

function formatEuro(amount: number | string): string {
  const num = Number(amount || 0);
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number.isFinite(num) ? num : 0);
}

function buildItemsTableHtml(items: OrderItem[]): string {
  const safeItems = Array.isArray(items) ? items : [];
  const rows = safeItems
    .map((item) => {
      const qty = Number(item.qty || 1);
      const price = Number(item.price || 0);
      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #F2EFE9; color: #1C1917;">
            <strong>${escapeHtmlText(item.name || "Création Club Parfum")}</strong><br />
            <span style="font-size: 12px; color: #57534E;">${escapeHtmlText(item.variant || "")}</span>
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #F2EFE9; text-align: center; color: #44403C;">${qty}</td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #F2EFE9; text-align: right; font-weight: 600; color: #1C1917;">${escapeHtmlText(formatEuro(price * qty))}</td>
        </tr>`;
    })
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
      <thead>
        <tr style="background-color: #F2EFE9; text-align: left;">
          <th style="padding: 9px 8px; border-bottom: 1px solid #E7E2DA; color: #1C1917;">Création</th>
          <th style="padding: 9px 8px; border-bottom: 1px solid #E7E2DA; text-align: center; color: #1C1917;">Qté</th>
          <th style="padding: 9px 8px; border-bottom: 1px solid #E7E2DA; text-align: right; color: #1C1917;">Total TTC</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
}

function formatDeliveryBlockHtml(order: EmailOrderData, includePrivateAccessCodes: boolean): string {
  if (order.relay_point) {
    const relayRef = order.relay_point_id ? ` (Réf. ${escapeHtmlText(order.relay_point_id)})` : "";
    return `
      <p style="margin: 4px 0; color: #44403C;">
        <strong>Mode :</strong> ${escapeHtmlText(order.shipping_method)}<br />
        <strong>Point Relais :</strong> ${escapeHtmlText(order.relay_point)}${relayRef}
      </p>`;
  }

  const addressParts = [
    order.address,
    includePrivateAccessCodes && order.building ? `Bâtiment : ${order.building}` : null,
    includePrivateAccessCodes && order.digicode ? `Digicode : ${order.digicode}` : null,
    [order.postal_code, order.city].filter(Boolean).join(" "),
  ].filter((part): part is string => Boolean(part && part.trim()));

  return `
    <p style="margin: 4px 0; color: #44403C;">
      <strong>Mode :</strong> ${escapeHtmlText(order.shipping_method)}<br />
      <strong>Adresse :</strong> ${escapeHtmlText(addressParts.join(" • ") || "Non renseignée")}
    </p>`;
}

function wrapEmailLayout(title: string, subtitle: string, bodyHtml: string): string {
  return `
    <div style="background-color: #FAFAF8; padding: 28px 16px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #1C1917; font-size: 14px; line-height: 1.6;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E2DA; padding: 28px;">
        <div style="border-bottom: 2px solid #A16207; padding-bottom: 14px; margin-bottom: 22px;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #A16207; font-weight: bold;">
            ${escapeHtmlText(STORE_CONFIG.brandName)} • ${escapeHtmlText(STORE_CONFIG.brandSubtitle)}
          </p>
          <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: normal; color: #1C1917;">
            ${escapeHtmlText(title)}
          </h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #57534E;">
            ${escapeHtmlText(subtitle)}
          </p>
        </div>

        ${bodyHtml}

        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #E7E2DA; font-size: 12px; color: #57534E;">
          <p style="margin: 0 0 4px 0;">
            <strong>${escapeHtmlText(STORE_CONFIG.brandName)}</strong> — ${escapeHtmlText(STORE_CONFIG.legal.status)}
          </p>
          <p style="margin: 0 0 4px 0;">
            ${escapeHtmlText(STORE_CONFIG.legal.tvaNotice)} • SIRET : ${escapeHtmlText(getLegalFieldOrFallback(STORE_CONFIG.legal.siret))}
          </p>
          <p style="margin: 0;">
            Service Client : <a href="mailto:${escapeHtmlText(STORE_CONFIG.contactEmail)}" style="color: #A16207; text-decoration: none;">${escapeHtmlText(STORE_CONFIG.contactEmail)}</a> • ${escapeHtmlText(STORE_CONFIG.contactPhone)}
          </p>
        </div>
      </div>
    </div>`;
}

function getCarrierTrackingUrl(shippingMethod: string, tracking: string): string {
  const lower = shippingMethod.toLowerCase();
  const encoded = encodeURIComponent(tracking.trim());
  if (lower.includes("mondial") || lower.includes("relay")) {
    return `https://www.mondialrelay.fr/suivi-de-colis/?numeroExpedition=${encoded}`;
  }
  if (lower.includes("chronopost") || lower.includes("express")) {
    return `https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=${encoded}`;
  }
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encoded}`;
}

export async function sendOrderConfirmationEmail(order: EmailOrderData): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY manquante : e-mail de confirmation client ignoré.");
    return { sent: false, skipped: true };
  }

  const invoiceRef = order.invoice_number || order.order_number;
  const ownerDisplay = getLegalFieldOrFallback(STORE_CONFIG.legal.ownerName);
  const addressDisplay = getLegalFieldOrFallback(STORE_CONFIG.legal.address);

  const bodyHtml = `
    <p style="margin: 0 0 12px 0;">Bonjour ${escapeHtmlText(order.customer_first_name || order.customer_name)},</p>
    <p style="margin: 0 0 16px 0; color: #44403C;">
      Nous vous remercions pour votre commande auprès de notre atelier de Grasse. Votre règlement a bien été validé et vos créations sont en cours de préparation.
    </p>

    <div style="background-color: #FAFAF8; border: 1px solid #E7E2DA; padding: 14px 16px; margin-bottom: 18px; font-size: 13px;">
      <p style="margin: 0 0 6px 0;"><strong>N° de commande :</strong> #${escapeHtmlText(order.order_number)}</p>
      <p style="margin: 0 0 6px 0;"><strong>N° de facture :</strong> ${escapeHtmlText(invoiceRef)}</p>
      <p style="margin: 0;"><strong>Date :</strong> ${escapeHtmlText(order.date)}</p>
    </div>

    ${buildItemsTableHtml(order.items)}

    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 18px;">
      <tbody>
        <tr>
          <td style="padding: 4px 0; color: #57534E;">Sous-total articles</td>
          <td style="padding: 4px 0; text-align: right; color: #1C1917;">${escapeHtmlText(formatEuro(order.subtotal))}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #57534E;">Frais de livraison (${escapeHtmlText(order.shipping_method)})</td>
          <td style="padding: 4px 0; text-align: right; color: #1C1917;">${Number(order.shipping_cost) === 0 ? "Offerts" : escapeHtmlText(formatEuro(order.shipping_cost))}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0 4px 0; border-top: 1px solid #E7E2DA; font-size: 15px; font-weight: bold;">Total réglé TTC</td>
          <td style="padding: 10px 0 4px 0; border-top: 1px solid #E7E2DA; text-align: right; font-size: 16px; font-weight: bold; color: #A16207;">${escapeHtmlText(formatEuro(order.total))}</td>
        </tr>
      </tbody>
    </table>

    <p style="margin: 0 0 16px 0; font-size: 12px; color: #A16207; text-align: right;">
      ${escapeHtmlText(STORE_CONFIG.legal.tvaNotice)}
    </p>

    <div style="background-color: #F5F2EB; border: 1px solid #E7E2DA; padding: 14px 16px; margin-bottom: 18px; font-size: 13px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A16207; font-weight: bold;">
        Informations d'expédition
      </p>
      ${formatDeliveryBlockHtml(order, false)}
    </div>

    <div style="font-size: 12px; color: #57534E; margin-bottom: 16px;">
      <p style="margin: 0 0 4px 0;"><strong>Émetteur de la facture :</strong> ${escapeHtmlText(STORE_CONFIG.brandName)} — ${escapeHtmlText(ownerDisplay)}</p>
      <p style="margin: 0;"><strong>Adresse atelier :</strong> ${escapeHtmlText(addressDisplay)}</p>
    </div>

    <p style="margin: 0;">
      <a href="${escapeHtmlText(STORE_CONFIG.siteUrl)}/compte" style="display: inline-block; background-color: #1C1917; color: #FFFFFF; padding: 11px 22px; text-decoration: none; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold;">
        Suivre ma commande
      </a>
    </p>`;

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: [order.customer_email],
      subject: `Confirmation & Facture ${invoiceRef} — Commande #${order.order_number} | Club Parfum`,
      html: wrapEmailLayout(
        "Merci pour votre commande",
        `Commande #${order.order_number} • Facture ${invoiceRef}`,
        bodyHtml
      ),
    });

    if (error) {
      console.error("Erreur Resend confirmation client:", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Resend";
    console.error("Exception Resend confirmation client:", message);
    return { sent: false, error: message };
  }
}

export async function sendAdminNewOrderEmail(order: EmailOrderData): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY manquante : alerte admin ignorée.");
    return { sent: false, skipped: true };
  }

  const bodyHtml = `
    <p style="margin: 0 0 14px 0; color: #1C1917;">
      Une nouvelle commande vient d'être <strong>payée et validée via Stripe</strong>.
    </p>

    <div style="background-color: #FAFAF8; border: 1px solid #E7E2DA; padding: 14px 16px; margin-bottom: 16px; font-size: 13px;">
      <p style="margin: 0 0 4px 0;"><strong>Commande :</strong> #${escapeHtmlText(order.order_number)}</p>
      <p style="margin: 0 0 4px 0;"><strong>Facture :</strong> ${escapeHtmlText(order.invoice_number || "En cours")}</p>
      <p style="margin: 0 0 4px 0;"><strong>Client :</strong> ${escapeHtmlText(order.customer_name)} (${escapeHtmlText(order.customer_email)})</p>
      <p style="margin: 0;"><strong>Téléphone :</strong> ${escapeHtmlText(order.customer_phone)}</p>
    </div>

    <div style="background-color: #F5F2EB; border: 1px solid #E7E2DA; padding: 14px 16px; margin-bottom: 16px; font-size: 13px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A16207; font-weight: bold;">
        Logistique &amp; Coordonnées de livraison
      </p>
      ${formatDeliveryBlockHtml(order, true)}
    </div>

    ${buildItemsTableHtml(order.items)}

    <p style="margin: 0 0 18px 0; font-size: 15px; font-weight: bold; text-align: right; color: #1C1917;">
      Total encaissé TTC : <span style="color: #A16207;">${escapeHtmlText(formatEuro(order.total))}</span>
    </p>

    <p style="margin: 0;">
      <a href="${escapeHtmlText(STORE_CONFIG.siteUrl)}/admin" style="display: inline-block; background-color: #1C1917; color: #FFFFFF; padding: 11px 22px; text-decoration: none; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold;">
        Ouvrir le Back-Office
      </a>
    </p>`;

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: getAdminRecipients(),
      subject: `[Nouvelle Commande Payée] #${order.order_number} — ${formatEuro(order.total)}`,
      html: wrapEmailLayout(
        `Nouvelle commande #${order.order_number}`,
        `Client : ${order.customer_name} • ${formatEuro(order.total)}`,
        bodyHtml
      ),
    });

    if (error) {
      console.error("Erreur Resend alerte admin:", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Resend";
    console.error("Exception Resend alerte admin:", message);
    return { sent: false, error: message };
  }
}

export async function sendOrderShippedEmail(order: EmailOrderData): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY manquante : e-mail d'expédition ignoré.");
    return { sent: false, skipped: true };
  }

  const cleanTracking = (order.tracking || "").trim();
  const trackingUrl = cleanTracking ? getCarrierTrackingUrl(order.shipping_method, cleanTracking) : "";

  const trackingBlock = cleanTracking
    ? `
      <div style="background-color: #F5F2EB; border: 1px solid #E7E2DA; padding: 16px; margin: 18px 0;">
        <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A16207; font-weight: bold;">
          Numéro de suivi ${escapeHtmlText(order.shipping_method)}
        </p>
        <p style="margin: 0 0 12px 0; font-family: monospace; font-size: 16px; font-weight: bold; color: #1C1917;">
          ${escapeHtmlText(cleanTracking)}
        </p>
        <a href="${escapeHtmlText(trackingUrl)}" style="display: inline-block; background-color: #1C1917; color: #FFFFFF; padding: 10px 20px; text-decoration: none; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold;">
          Suivre mon colis en ligne
        </a>
      </div>`
    : `
      <div style="background-color: #F5F2EB; border: 1px solid #E7E2DA; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #44403C;">
        Votre colis vient d'être remis à <strong>${escapeHtmlText(order.shipping_method)}</strong>.
      </div>`;

  const bodyHtml = `
    <p style="margin: 0 0 12px 0;">Bonjour ${escapeHtmlText(order.customer_first_name || order.customer_name)},</p>
    <p style="margin: 0 0 14px 0; color: #44403C;">
      Bonne nouvelle : votre commande <strong>#${escapeHtmlText(order.order_number)}</strong> préparée à l'atelier de Grasse vient d'être expédiée.
    </p>
    ${trackingBlock}
    ${formatDeliveryBlockHtml(order, false)}
    <p style="margin: 16px 0 0 0; font-size: 13px; color: #57534E;">
      Vous pouvez également retrouver ces informations à tout moment dans votre espace client sur <a href="${escapeHtmlText(STORE_CONFIG.siteUrl)}/compte" style="color: #A16207;">Mon Compte</a>.
    </p>`;

  try {
    const { error } = await resend.emails.send({
      from: getFromEmail(),
      to: [order.customer_email],
      subject: `Votre commande #${order.order_number} est expédiée | Club Parfum`,
      html: wrapEmailLayout(
        "Votre colis est en route",
        `Commande #${order.order_number} • ${order.shipping_method}`,
        bodyHtml
      ),
    });

    if (error) {
      console.error("Erreur Resend avis d'expédition:", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Resend";
    console.error("Exception Resend avis d'expédition:", message);
    return { sent: false, error: message };
  }
}

export async function sendWithdrawalConfirmationEmails(
  payload: WithdrawalEmailData
): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn("RESEND_API_KEY manquante : e-mails de rétractation ignorés.");
    return { sent: false, skipped: true };
  }

  const returnAddress = getLegalFieldOrFallback(STORE_CONFIG.legal.address);

  const clientBodyHtml = `
    <p style="margin: 0 0 12px 0;">Bonjour ${escapeHtmlText(payload.customerName)},</p>
    <p style="margin: 0 0 14px 0; color: #44403C;">
      Nous accusons bonne réception de votre demande d'exercice du droit de rétractation (art. L.221-18 du Code de la consommation).
    </p>
    <div style="background-color: #FAFAF8; border: 1px solid #E7E2DA; padding: 14px 16px; margin-bottom: 16px; font-size: 13px;">
      <p style="margin: 0 0 4px 0;"><strong>Référence de dossier :</strong> ${escapeHtmlText(payload.reference)}</p>
      <p style="margin: 0 0 4px 0;"><strong>Commande concernée :</strong> #${escapeHtmlText(payload.orderNumber)}</p>
      ${payload.reason ? `<p style="margin: 0;"><strong>Motif indiqué :</strong> ${escapeHtmlText(payload.reason)}</p>` : ""}
    </div>
    <div style="background-color: #F5F2EB; border: 1px solid #E7E2DA; padding: 14px 16px; margin-bottom: 16px; font-size: 13px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A16207; font-weight: bold;">
        Adresse de retour atelier
      </p>
      <p style="margin: 0; color: #1C1917;">
        ${escapeHtmlText(STORE_CONFIG.brandName)}<br />
        ${escapeHtmlText(returnAddress)}
      </p>
    </div>
    <p style="margin: 0; font-size: 12px; color: #57534E;">
      Rappel sanitaire (art. L.221-28 5°) : les parfums, diffuseurs et bougies doivent être retournés strictement scellés, non ouverts et non allumés dans leur emballage d'origine. Les frais de retour sont à la charge de l'acheteur.
    </p>`;

  const adminBodyHtml = `
    <p style="margin: 0 0 12px 0;">Nouvelle demande de rétractation enregistrée en ligne :</p>
    <div style="background-color: #FAFAF8; border: 1px solid #E7E2DA; padding: 14px 16px; font-size: 13px;">
      <p style="margin: 0 0 4px 0;"><strong>Référence :</strong> ${escapeHtmlText(payload.reference)}</p>
      <p style="margin: 0 0 4px 0;"><strong>Commande :</strong> #${escapeHtmlText(payload.orderNumber)}</p>
      <p style="margin: 0 0 4px 0;"><strong>Client :</strong> ${escapeHtmlText(payload.customerName)} (${escapeHtmlText(payload.customerEmail)})</p>
      <p style="margin: 0;"><strong>Motif :</strong> ${escapeHtmlText(payload.reason || "Non précisé")}</p>
    </div>`;

  try {
    const [clientRes, adminRes] = await Promise.all([
      resend.emails.send({
        from: getFromEmail(),
        to: [payload.customerEmail],
        subject: `Accusé de réception rétractation ${payload.reference} — Commande #${payload.orderNumber}`,
        html: wrapEmailLayout(
          "Demande de rétractation enregistrée",
          `Dossier ${payload.reference} • Commande #${payload.orderNumber}`,
          clientBodyHtml
        ),
      }),
      resend.emails.send({
        from: getFromEmail(),
        to: getAdminRecipients(),
        subject: `[Rétractation] Dossier ${payload.reference} — Commande #${payload.orderNumber}`,
        html: wrapEmailLayout(
          "Nouvelle demande de rétractation",
          `Dossier ${payload.reference}`,
          adminBodyHtml
        ),
      }),
    ]);

    if (clientRes.error || adminRes.error) {
      const errMsg = clientRes.error?.message || adminRes.error?.message || "Erreur Resend";
      console.error("Erreur Resend rétractation:", errMsg);
      return { sent: false, error: errMsg };
    }

    return { sent: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur Resend";
    console.error("Exception Resend rétractation:", message);
    return { sent: false, error: message };
  }
}
