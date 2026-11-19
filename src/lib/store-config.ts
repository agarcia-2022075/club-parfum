export interface StoreLegalConfig {
  status: string;
  ownerName: string;
  address: string;
  siret: string;
  tvaNotice: string;
  mediatorName: string;
  mediatorAddress: string;
  mediatorUrl: string;
}

export interface StoreConfig {
  siteUrl: string;
  brandName: string;
  brandSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  whatsappDigits: string;
  legal: StoreLegalConfig;
}

const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://club-parfum.fr").trim();
const normalizedSiteUrl = rawSiteUrl.replace(/\/+$/, "");

const rawContactEmail = (process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@clubparfum.fr").trim();
const rawContactPhone = (process.env.NEXT_PUBLIC_CONTACT_PHONE || "+33 7 69 91 42 51").trim();

export const LEGAL_PENDING_NOTICE =
  "Information en cours de finalisation — disponible sur simple demande à contact@clubparfum.fr";

export function getLegalFieldOrFallback(value: string): string {
  const cleaned = value.trim();
  return cleaned || LEGAL_PENDING_NOTICE;
}

export const STORE_CONFIG: StoreConfig = {
  siteUrl: normalizedSiteUrl,
  brandName: "Club Parfum",
  brandSubtitle: "Maison de Senteurs • Grasse",
  contactEmail: rawContactEmail,
  contactPhone: rawContactPhone,
  whatsappDigits: rawContactPhone.replace(/\D/g, "") || "33769914251",
  legal: {
    status: "Entrepreneur Individuel (EI) — Micro-entreprise",
    ownerName: (process.env.NEXT_PUBLIC_LEGAL_OWNER_NAME || "").trim(),
    address: (process.env.NEXT_PUBLIC_LEGAL_ADDRESS || "").trim(),
    siret: (process.env.NEXT_PUBLIC_LEGAL_SIRET || "").trim(),
    tvaNotice: "TVA non applicable, art. 293 B du CGI",
    mediatorName: (
      process.env.NEXT_PUBLIC_MEDIATOR_NAME ||
      "Centre de la Médiation de la Consommation de Conciliateurs de Justice (CM2C)"
    ).trim(),
    mediatorAddress: (
      process.env.NEXT_PUBLIC_MEDIATOR_ADDRESS || "49 Rue de Ponthieu, 75008 Paris"
    ).trim(),
    mediatorUrl: (process.env.NEXT_PUBLIC_MEDIATOR_URL || "https://cm2c.net").trim(),
  },
};

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface PrintableInvoiceItem {
  name: string;
  variant: string;
  qty: number;
  price: number;
}

export interface PrintableInvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  date: string;
  paidAt?: string | null;
  customerName: string;
  customerEmail: string;
  shippingMethod: string;
  relayPoint?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  items: PrintableInvoiceItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

function formatEuroFr(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function openPrintableInvoice(invoice: PrintableInvoiceData): void {
  if (typeof window === "undefined") return;

  const printWin = window.open("", "_blank", "width=840,height=960");
  if (!printWin) {
    window.print();
    return;
  }

  const ownerDisplay = escapeHtmlText(getLegalFieldOrFallback(STORE_CONFIG.legal.ownerName));
  const addressDisplay = escapeHtmlText(getLegalFieldOrFallback(STORE_CONFIG.legal.address));
  const siretDisplay = escapeHtmlText(getLegalFieldOrFallback(STORE_CONFIG.legal.siret));

  const deliveryAddress = invoice.relayPoint
    ? `Point Relais : ${invoice.relayPoint}`
    : [invoice.address, [invoice.postalCode, invoice.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ");

  const rowsHtml = invoice.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA;">
          <strong>${escapeHtmlText(item.name)}</strong><br />
          <span style="color: #57534E; font-size: 12px;">${escapeHtmlText(item.variant)}</span>
        </td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA; text-align: center;">${Number(item.qty)}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA; text-align: right;">${escapeHtmlText(formatEuroFr(Number(item.price)))}</td>
        <td style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA; text-align: right; font-weight: 600;">${escapeHtmlText(formatEuroFr(Number(item.price) * Number(item.qty)))}</td>
      </tr>`
    )
    .join("");

  const issuedDate = invoice.paidAt
    ? new Date(invoice.paidAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : invoice.date;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Facture ${escapeHtmlText(invoice.invoiceNumber)} - ${escapeHtmlText(STORE_CONFIG.brandName)}</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #1C1917; background: #FFFFFF; margin: 0; padding: 36px; line-height: 1.5;">
  <div style="max-width: 720px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #A16207; padding-bottom: 18px; margin-bottom: 24px;">
      <div>
        <div style="font-size: 24px; letter-spacing: 3px; text-transform: uppercase; font-weight: 600;">${escapeHtmlText(STORE_CONFIG.brandName)}</div>
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #A16207; margin-top: 4px;">${escapeHtmlText(STORE_CONFIG.brandSubtitle)}</div>
        <div style="font-size: 12px; color: #57534E; margin-top: 10px;">
          ${escapeHtmlText(STORE_CONFIG.legal.status)}<br />
          Exploitant : ${ownerDisplay}<br />
          Adresse : ${addressDisplay}<br />
          SIRET : ${siretDisplay}<br />
          Contact : ${escapeHtmlText(STORE_CONFIG.contactEmail)} • ${escapeHtmlText(STORE_CONFIG.contactPhone)}
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #A16207; font-weight: 700;">Facture</div>
        <div style="font-size: 20px; font-weight: 700; margin-top: 4px;">${escapeHtmlText(invoice.invoiceNumber)}</div>
        <div style="font-size: 12px; color: #57534E; margin-top: 6px;">
          Commande : <strong>#${escapeHtmlText(invoice.orderNumber)}</strong><br />
          Date d'émission : ${escapeHtmlText(issuedDate)}
        </div>
      </div>
    </div>

    <div style="background: #FAFAF8; border: 1px solid #E7E2DA; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px; font-size: 13px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A16207; font-weight: 700; margin-bottom: 6px;">Client &amp; Expédition</div>
      <strong>${escapeHtmlText(invoice.customerName)}</strong> (${escapeHtmlText(invoice.customerEmail)})<br />
      Mode : ${escapeHtmlText(invoice.shippingMethod)}<br />
      ${deliveryAddress ? `Destination : ${escapeHtmlText(deliveryAddress)}` : ""}
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
      <thead>
        <tr style="background: #F2EFE9; text-align: left;">
          <th style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA;">Désignation</th>
          <th style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA; text-align: center;">Qté</th>
          <th style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA; text-align: right;">P.U. TTC</th>
          <th style="padding: 10px 8px; border-bottom: 1px solid #E7E2DA; text-align: right;">Total TTC</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div style="max-width: 300px; margin-left: auto; font-size: 13px; space-y: 6px;">
      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span style="color: #57534E;">Sous-total articles</span>
        <span>${escapeHtmlText(formatEuroFr(Number(invoice.subtotal)))}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0;">
        <span style="color: #57534E;">Frais de livraison</span>
        <span>${Number(invoice.shippingCost) === 0 ? "Offerts" : escapeHtmlText(formatEuroFr(Number(invoice.shippingCost)))}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; margin-top: 6px; border-top: 2px solid #1C1917; font-size: 16px; font-weight: 700;">
        <span>Total réglé TTC</span>
        <span>${escapeHtmlText(formatEuroFr(Number(invoice.total)))}</span>
      </div>
      <div style="text-align: right; font-size: 11px; color: #A16207; font-weight: 600;">
        ${escapeHtmlText(STORE_CONFIG.legal.tvaNotice)}
      </div>
    </div>

    <div style="margin-top: 36px; padding-top: 14px; border-top: 1px solid #E7E2DA; font-size: 11px; color: #57534E; text-align: center;">
      ${escapeHtmlText(STORE_CONFIG.brandName)} • ${escapeHtmlText(STORE_CONFIG.legal.tvaNotice)} • Merci pour votre confiance.
    </div>
  </div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
}
