import { NextRequest, NextResponse } from "next/server";
import { createServerAuthClient, getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { STORE_CONFIG } from "@/lib/store-config";
import { SHIPPING_METHODS } from "@/data/mock-data";
import { FREE_SHIPPING_THRESHOLD, OrderItem, OrderLineRecord } from "@/types/store";

interface CheckoutItemInput {
  productId?: unknown;
  variantId?: unknown;
  quantity?: unknown;
}

interface CheckoutRequestBody {
  items?: unknown;
  shippingMethodCode?: unknown;
  customer?: {
    firstName?: unknown;
    lastName?: unknown;
    email?: unknown;
    phone?: unknown;
  };
  address?: {
    street?: unknown;
    building?: unknown;
    digicode?: unknown;
    postalCode?: unknown;
    city?: unknown;
  };
  relayPoint?: {
    id?: unknown;
    label?: unknown;
  } | null;
  cgvAccepted?: unknown;
}

interface DbVariantQueryRow {
  id: string;
  sku: string;
  size_label: string;
  price: number | string;
  in_stock: boolean;
  stock_quantity?: number | null;
}

interface DbProductQueryRow {
  id: string;
  name: string;
  images: string[] | null;
  base_price: number | string;
  is_active: boolean;
  product_variants: DbVariantQueryRow[] | null;
}

function sanitizeText(value: unknown, maxLength = 150): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Configuration Supabase d'administration manquante sur le serveur." },
        { status: 500 }
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Le paiement en ligne Stripe n'est pas encore activé sur le serveur." },
        { status: 503 }
      );
    }

    let body: CheckoutRequestBody;
    try {
      body = (await request.json()) as CheckoutRequestBody;
    } catch {
      return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
    }

    if (body.cgvAccepted !== true) {
      return NextResponse.json(
        { error: "Vous devez accepter les Conditions Générales de Vente pour poursuivre." },
        { status: 400 }
      );
    }

    // 1. Validation des coordonnées client
    const firstName = sanitizeText(body.customer?.firstName, 60);
    const lastName = sanitizeText(body.customer?.lastName, 60);
    const email = sanitizeText(body.customer?.email, 120).toLowerCase();
    const phone = sanitizeText(body.customer?.phone, 30);

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre prénom et votre nom." },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Veuillez renseigner une adresse e-mail valide." },
        { status: 400 }
      );
    }

    if (!phone || phone.replace(/\s+/g, "").length < 6) {
      return NextResponse.json(
        { error: "Veuillez renseigner un numéro de téléphone valide pour le suivi colis." },
        { status: 400 }
      );
    }

    // 2. Validation livraison & adresse française
    const shippingCode = sanitizeText(body.shippingMethodCode, 30);
    const shippingMethod = SHIPPING_METHODS.find((m) => m.code === shippingCode);
    if (!shippingMethod) {
      return NextResponse.json(
        { error: "Mode de livraison invalide." },
        { status: 400 }
      );
    }

    const postalCode = sanitizeText(body.address?.postalCode, 10);
    const city = sanitizeText(body.address?.city, 80);
    const street = sanitizeText(body.address?.street, 180);
    const building = sanitizeText(body.address?.building, 80);
    const digicode = sanitizeText(body.address?.digicode, 40);

    if (!/^\d{5}$/.test(postalCode)) {
      return NextResponse.json(
        { error: "Veuillez saisir un code postal français valide à 5 chiffres." },
        { status: 400 }
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre ville." },
        { status: 400 }
      );
    }

    const relayLabel = sanitizeText(body.relayPoint?.label, 220);
    const relayId = sanitizeText(body.relayPoint?.id, 60) || null;

    if (shippingMethod.requires_relay_point) {
      if (!relayLabel) {
        return NextResponse.json(
          { error: "Veuillez sélectionner ou préciser votre Point Relais." },
          { status: 400 }
        );
      }
    } else if (!street) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre adresse de livraison." },
        { status: 400 }
      );
    }

    // 3. Validation des articles du panier
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Votre panier est vide." },
        { status: 400 }
      );
    }

    const parsedItems: { productId: string; variantId: string; quantity: number }[] = [];
    for (const rawItem of body.items) {
      const candidate = (rawItem && typeof rawItem === "object" ? rawItem : {}) as CheckoutItemInput;
      const productId = sanitizeText(candidate.productId, 80);
      const variantId = sanitizeText(candidate.variantId, 80) || "default";
      const quantity = Number(candidate.quantity);

      if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        return NextResponse.json(
          { error: "Un article du panier contient une quantité ou référence invalide." },
          { status: 400 }
        );
      }
      parsedItems.push({ productId, variantId, quantity });
    }

    // 4. Vérification optionnelle du JWT client (jamais faire confiance à un userId non vérifié)
    let verifiedUserId: string | null = null;
    const authHeader = request.headers.get("authorization") || "";
    if (/^Bearer\s+/i.test(authHeader)) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      const authClient = createServerAuthClient();
      if (authClient && token) {
        try {
          const { data: userData, error: userError } = await authClient.auth.getUser(token);
          if (!userError && userData?.user?.id) {
            verifiedUserId = userData.user.id;
          }
        } catch {
          verifiedUserId = null;
        }
      }
    }

    // 5. Lecture des prix & stocks réels côté serveur (100% anti-fraude)
    const uniqueProductIds = Array.from(new Set(parsedItems.map((it) => it.productId)));
    const { data: dbProducts, error: productsError } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, images, base_price, is_active, product_variants(id, sku, size_label, price, in_stock, stock_quantity)"
      )
      .in("id", uniqueProductIds);

    if (productsError || !dbProducts) {
      console.error("Erreur vérification catalogue /api/checkout/session:", productsError);
      return NextResponse.json(
        { error: "Impossible de vérifier les tarifs et disponibilités des créations." },
        { status: 500 }
      );
    }

    const productMap = new Map<string, DbProductQueryRow>();
    for (const row of dbProducts as DbProductQueryRow[]) {
      productMap.set(row.id, row);
    }

    const resolvedLines: {
      orderItem: OrderItem;
      unitPriceCents: number;
      image?: string;
      availableStock: number;
    }[] = [];
    const requestedQtyByVariant = new Map<string, number>();

    for (const item of parsedItems) {
      const dbProd = productMap.get(item.productId);
      if (!dbProd || !dbProd.is_active) {
        return NextResponse.json(
          { error: "Une des créations de votre panier n'est plus disponible à la vente." },
          { status: 409 }
        );
      }

      const variants = Array.isArray(dbProd.product_variants) ? dbProd.product_variants : [];
      let matchedVariant: DbVariantQueryRow | undefined;

      if (item.variantId && item.variantId !== "default") {
        matchedVariant = variants.find((v) => v.id === item.variantId);
      } else if (variants.length > 0) {
        matchedVariant = variants.find((v) => v.in_stock) || variants[0];
      }

      if (item.variantId !== "default" && variants.length > 0 && !matchedVariant) {
        return NextResponse.json(
          { error: `Le format sélectionné pour "${dbProd.name}" n'existe plus.` },
          { status: 400 }
        );
      }

      if (matchedVariant) {
        const stockQty =
          typeof matchedVariant.stock_quantity === "number" ? matchedVariant.stock_quantity : 25;

        if (!matchedVariant.in_stock || stockQty < item.quantity) {
          return NextResponse.json(
            {
              error: `Stock insuffisant pour "${dbProd.name}" (${matchedVariant.size_label}). Disponible : ${stockQty}.`,
            },
            { status: 409 }
          );
        }

        const totalForVariant = (requestedQtyByVariant.get(matchedVariant.id) || 0) + item.quantity;
        if (totalForVariant > stockQty) {
          return NextResponse.json(
            {
              error: `Quantité totale demandée supérieure au stock disponible pour "${dbProd.name}" (${matchedVariant.size_label}).`,
            },
            { status: 409 }
          );
        }
        requestedQtyByVariant.set(matchedVariant.id, totalForVariant);

        const unitPrice = Number(matchedVariant.price);
        resolvedLines.push({
          orderItem: {
            product_id: dbProd.id,
            variant_id: matchedVariant.id,
            sku: matchedVariant.sku,
            name: dbProd.name,
            variant: matchedVariant.size_label,
            qty: item.quantity,
            price: unitPrice,
          },
          unitPriceCents: Math.round(unitPrice * 100),
          image: dbProd.images?.[0],
          availableStock: stockQty,
        });
      } else {
        const unitPrice = Number(dbProd.base_price);
        resolvedLines.push({
          orderItem: {
            product_id: dbProd.id,
            name: dbProd.name,
            variant: "Format Standard",
            qty: item.quantity,
            price: unitPrice,
          },
          unitPriceCents: Math.round(unitPrice * 100),
          image: dbProd.images?.[0],
          availableStock: 25,
        });
      }
    }

    const subtotalCents = resolvedLines.reduce(
      (sum, line) => sum + line.unitPriceCents * line.orderItem.qty,
      0
    );
    const subtotal = Math.round(subtotalCents) / 100;

    const isFreeShipping =
      subtotal >= FREE_SHIPPING_THRESHOLD &&
      (shippingMethod.code === "relay" || shippingMethod.code === "colissimo");
    const shippingCost = isFreeShipping ? 0 : shippingMethod.price;
    const shippingCostCents = Math.round(shippingCost * 100);
    const total = Math.round(subtotalCents + shippingCostCents) / 100;

    // 6. Génération séquentielle française du numéro de commande
    let orderNumber = "";
    try {
      const { data: rpcOrderNum, error: rpcError } = await supabaseAdmin.rpc("next_order_number");
      if (!rpcError && typeof rpcOrderNum === "string" && rpcOrderNum.trim()) {
        orderNumber = rpcOrderNum.trim();
      }
    } catch (err) {
      console.warn("Repli génération numéro de commande:", err);
    }

    if (!orderNumber) {
      const year = new Date().getFullYear();
      orderNumber = `CP-${year}-${Date.now().toString().slice(-6)}`;
    }

    const orderId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const formattedDate = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const orderInsertPayload = {
      id: orderId,
      user_id: verifiedUserId,
      order_number: orderNumber,
      date: formattedDate,
      customer_first_name: firstName,
      customer_last_name: lastName,
      customer_name: `${firstName} ${lastName}`,
      customer_email: email,
      customer_phone: phone,
      shipping_method_id: shippingMethod.id,
      shipping_method: shippingMethod.name,
      shipping_cost: shippingCost,
      relay_point: shippingMethod.requires_relay_point ? relayLabel : null,
      relay_point_id: shippingMethod.requires_relay_point ? relayId : null,
      address: shippingMethod.requires_relay_point ? null : street,
      building: shippingMethod.requires_relay_point ? null : building || null,
      digicode: shippingMethod.requires_relay_point ? null : digicode || null,
      postal_code: postalCode,
      city,
      subtotal,
      total,
      status: "pending",
      payment_gateway: "stripe",
      payment_status: "pending",
      cgv_accepted: true,
      cgv_accepted_at: new Date().toISOString(),
      tracking: "",
      items: resolvedLines.map((l) => l.orderItem),
    };

    const { error: insertError } = await supabaseAdmin.from("orders").insert(orderInsertPayload);
    if (insertError) {
      console.error("Erreur insertion commande avant Stripe:", insertError);
      return NextResponse.json(
        { error: "Impossible d'enregistrer la commande avant le paiement." },
        { status: 500 }
      );
    }

    const orderItemRows: OrderLineRecord[] = resolvedLines.map((line, idx) => ({
      id: `${orderId}-item-${idx + 1}`,
      order_id: orderId,
      product_id: line.orderItem.product_id ?? null,
      variant_id: line.orderItem.variant_id ?? null,
      sku: line.orderItem.sku || "",
      product_name: line.orderItem.name,
      variant_label: line.orderItem.variant,
      unit_price: line.orderItem.price,
      quantity: line.orderItem.qty,
      total_price: Number((line.orderItem.price * line.orderItem.qty).toFixed(2)),
    }));

    if (orderItemRows.length > 0) {
      const { error: orderItemsError } = await supabaseAdmin
        .from("order_items")
        .insert(orderItemRows);

      if (orderItemsError) {
        console.error("Erreur insertion lignes order_items avant Stripe:", orderItemsError);
        await supabaseAdmin.from("orders").delete().eq("id", orderId);
        return NextResponse.json(
          { error: "Impossible d'enregistrer le détail des articles de la commande." },
          { status: 500 }
        );
      }
    }

    // 7. Création de la session Stripe Checkout
    const origin =
      process.env.NODE_ENV === "production"
        ? STORE_CONFIG.siteUrl
        : request.nextUrl.origin || STORE_CONFIG.siteUrl;

    const stripeLineItems = resolvedLines.map((line) => ({
      quantity: line.orderItem.qty,
      price_data: {
        currency: "eur",
        unit_amount: line.unitPriceCents,
        product_data: {
          name: `${line.orderItem.name} (${line.orderItem.variant})`,
          ...(line.image && line.image.startsWith("https://") ? { images: [line.image] } : {}),
        },
      },
    }));

    if (shippingCostCents > 0) {
      stripeLineItems.push({
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: shippingCostCents,
          product_data: {
            name: `Frais de livraison — ${shippingMethod.name}`,
          },
        },
      });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        locale: "fr",
        allow_promotion_codes: true,
        customer_email: email,
        line_items: stripeLineItems,
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
        },
        success_url: `${origin}/commander?status=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/commander?status=cancelled&order=${encodeURIComponent(orderNumber)}`,
      });

      const { error: updateSessionError } = await supabaseAdmin
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", orderId);

      if (updateSessionError) {
        console.warn("Avertissement liaison stripe_session_id:", updateSessionError.message);
      }

      if (!session.url) {
        await supabaseAdmin.from("orders").delete().eq("id", orderId);
        return NextResponse.json(
          { error: "Stripe n'a pas renvoyé d'URL de paiement valide." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          url: session.url,
          orderNumber,
        },
        { status: 200 }
      );
    } catch (stripeErr: unknown) {
      console.error("Erreur création session Stripe Checkout:", stripeErr);
      await supabaseAdmin.from("orders").delete().eq("id", orderId);
      return NextResponse.json(
        { error: "Impossible d'initialiser la session de paiement Stripe. Veuillez réessayer." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Erreur inattendue POST /api/checkout/session:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue lors de la préparation du paiement." },
      { status: 500 }
    );
  }
}
