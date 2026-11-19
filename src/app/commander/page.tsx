"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RelayPointPicker, type SelectedRelayPoint } from "@/components/RelayPointPicker";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SHIPPING_METHODS } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";
import { openPrintableInvoice } from "@/lib/store-config";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { FREE_SHIPPING_THRESHOLD, OrderItem, ShippingMethod } from "@/types/store";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
  Loader2,
  User,
  Printer,
} from "lucide-react";

interface CheckoutFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  building: string;
  digicode: string;
  postalCode: string;
  city: string;
}

interface VerifiedOrderSummary {
  order_number: string;
  invoice_number: string | null;
  payment_status: string;
  status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_name: string;
  customer_email: string;
  shipping_method: string;
  relay_point: string | null;
  relay_point_id: string | null;
  address: string | null;
  postal_code: string;
  city: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  items: OrderItem[];
  date: string;
  paid_at: string | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const sessionIdParam = searchParams.get("session_id");
  const cancelledOrderParam = searchParams.get("order");

  const { items, subtotal, totalCount, clearCart, isHydrated } = useCart();
  const { user, updateProfile } = useAuth();

  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);
  const [relaySelection, setRelaySelection] = useState<SelectedRelayPoint | null>(null);
  const [cgvAccepted, setCgvAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrderSummary | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const hasClearedCartRef = useRef(false);

  const [formOverrides, setFormOverrides] = useState<{
    userId: string | null;
    values: Partial<CheckoutFormState>;
  }>({
    userId: null,
    values: {},
  });

  const currentUserId = user?.id || null;
  const activeOverrides = formOverrides.userId === currentUserId ? formOverrides.values : {};

  const formData: CheckoutFormState = {
    firstName: activeOverrides.firstName ?? user?.firstName ?? "",
    lastName: activeOverrides.lastName ?? user?.lastName ?? "",
    email: activeOverrides.email ?? user?.email ?? "",
    phone: activeOverrides.phone ?? user?.phone ?? "",
    address: activeOverrides.address ?? user?.address ?? "",
    building: activeOverrides.building ?? user?.building ?? "",
    digicode: activeOverrides.digicode ?? user?.digicode ?? "",
    postalCode: activeOverrides.postalCode ?? user?.postalCode ?? "",
    city: activeOverrides.city ?? user?.city ?? "",
  };

  const updateFormField = (patch: Partial<CheckoutFormState>) => {
    setFormOverrides((prev) => ({
      userId: currentUserId,
      values: {
        ...(prev.userId === currentUserId ? prev.values : {}),
        ...patch,
      },
    }));
  };

  const isVerifyingSuccess =
    statusParam === "success" && Boolean(sessionIdParam) && !verifiedOrder && !verifyError;

  useEffect(() => {
    if (statusParam !== "success" || !sessionIdParam) {
      return;
    }

    const activeSessionId = sessionIdParam;
    let isMounted = true;

    async function verifyStripeSession() {
      try {
        const res = await fetch(
          `/api/checkout/verify-session?session_id=${encodeURIComponent(activeSessionId)}`
        );
        const data = (await res.json().catch(() => ({}))) as {
          order?: VerifiedOrderSummary;
          error?: string;
        };

        if (!isMounted) return;

        if (!res.ok || !data.order) {
          setVerifyError(
            data.error || "Impossible de vérifier votre commande auprès de Stripe."
          );
          return;
        }

        setVerifiedOrder(data.order);
        if (!hasClearedCartRef.current) {
          hasClearedCartRef.current = true;
          clearCart();
        }
      } catch {
        if (isMounted) {
          setVerifyError("Erreur réseau lors de la vérification du paiement.");
        }
      }
    }

    void verifyStripeSession();

    return () => {
      isMounted = false;
    };
  }, [statusParam, sessionIdParam, clearCart]);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  const getShippingCost = (method: ShippingMethod) => {
    if (isFreeShipping && (method.code === "relay" || method.code === "colissimo")) {
      return 0;
    }
    return method.price;
  };

  const effectiveShippingPrice = getShippingCost(selectedShipping);
  const totalOrder = subtotal + effectiveShippingPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanedPhone = formData.phone.trim();
    if (!cleanedPhone || cleanedPhone.replace(/\s+/g, "").length < 6) {
      setErrorMessage("Veuillez renseigner un numéro de téléphone de contact valide.");
      return;
    }

    const cleanedPostalCode = formData.postalCode.trim();
    if (!/^\d{5}$/.test(cleanedPostalCode)) {
      setErrorMessage("Veuillez renseigner un code postal français valide à 5 chiffres.");
      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage("Veuillez renseigner votre ville.");
      return;
    }

    if (selectedShipping.requires_relay_point) {
      if (!relaySelection || !relaySelection.label.trim()) {
        setErrorMessage("Veuillez sélectionner ou confirmer votre Point Relais Mondial Relay.");
        return;
      }
    } else if (!formData.address.trim()) {
      setErrorMessage("Veuillez renseigner votre adresse de livraison.");
      return;
    }

    if (!cgvAccepted) {
      setErrorMessage("Veuillez accepter les Conditions Générales de Vente pour poursuivre.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = items.map((it) => {
        const prefix = `${it.productId}-`;
        const variantId = it.id.startsWith(prefix) ? it.id.slice(prefix.length) : "default";
        return {
          productId: it.productId,
          variantId,
          quantity: it.quantity,
        };
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (isSupabaseConfigured && supabase) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session?.access_token) {
            headers["Authorization"] = `Bearer ${session.access_token}`;
          }
        } catch {
          // Poursuivre sans jeton si lecture session impossible
        }
      }

      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers,
        body: JSON.stringify({
          items: itemsPayload,
          shippingMethodCode: selectedShipping.code,
          customer: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: cleanedPhone,
          },
          address: {
            street: formData.address.trim(),
            building: formData.building.trim(),
            digicode: formData.digicode.trim(),
            postalCode: cleanedPostalCode,
            city: formData.city.trim(),
          },
          relayPoint: selectedShipping.requires_relay_point ? relaySelection : null,
          cgvAccepted,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!res.ok || !data.url) {
        setErrorMessage(
          data.error ||
            "Impossible de préparer la page de paiement Stripe. Veuillez réessayer."
        );
        setIsSubmitting(false);
        return;
      }

      // Synchroniser le carnet d'adresses du client connecté sans bloquer la redirection Stripe
      if (user) {
        const profileUpdates: Partial<typeof user> = {};
        if (!user.address && formData.address.trim()) {
          profileUpdates.address = formData.address.trim();
        }
        if (!user.building && formData.building.trim()) {
          profileUpdates.building = formData.building.trim();
        }
        if (!user.digicode && formData.digicode.trim()) {
          profileUpdates.digicode = formData.digicode.trim();
        }
        if (!user.postalCode && cleanedPostalCode) {
          profileUpdates.postalCode = cleanedPostalCode;
        }
        if (!user.city && formData.city.trim()) {
          profileUpdates.city = formData.city.trim();
        }
        if (!user.phone && cleanedPhone) {
          profileUpdates.phone = cleanedPhone;
        }

        if (Object.keys(profileUpdates).length > 0) {
          updateProfile(profileUpdates).catch((err) =>
            console.warn("Erreur auto-sauvegarde profil:", err)
          );
        }
      }

      window.location.href = data.url;
    } catch {
      setErrorMessage(
        "Erreur de connexion réseau lors de la préparation du paiement. Veuillez réessayer."
      );
      setIsSubmitting(false);
    }
  };

  // --- ÉCRAN VÉRIFICATION POST-STRIPE ---
  if (isVerifyingSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#A16207]" />
          <p className="text-sm font-medium text-[#57534E]">
            Vérification sécurisée de votre règlement Stripe...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (statusParam === "success" && verifyError) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-[#1C1917]">Vérification impossible</h1>
          <p className="text-sm text-[#57534E]">{verifyError}</p>
          <div className="pt-2">
            <Link
              href="/compte"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              <span>Consulter mes commandes</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // --- ÉCRAN DE CONFIRMATION RÉELLE ---
  if (verifiedOrder) {
    const isPaid = verifiedOrder.payment_status === "paid";

    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center space-y-6 w-full">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-[#A16207] font-semibold block">
              Commande #{verifiedOrder.order_number}
              {verifiedOrder.invoice_number ? ` • Facture ${verifiedOrder.invoice_number}` : ""}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917]">
              Merci pour votre commande, {verifiedOrder.customer_first_name} !
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isPaid
                  ? "Paiement confirmé par Stripe"
                  : "Paiement en cours de confirmation"}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-lg mx-auto font-light">
            Un e-mail récapitulatif avec votre facture a été envoyé à{" "}
            <strong className="text-[#1C1917]">{verifiedOrder.customer_email}</strong>. Vos créations artisanales de Grasse sont en cours de préparation.
          </p>

          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] max-w-lg mx-auto text-left space-y-4 text-xs text-[#57534E]">
            <div className="space-y-1.5">
              <p className="font-semibold text-[#1C1917]">Détails de l&apos;expédition :</p>
              <p>
                Mode :{" "}
                <span className="font-medium text-[#A16207]">
                  {verifiedOrder.shipping_method}
                </span>
              </p>
              {verifiedOrder.relay_point ? (
                <p>
                  Lieu de retrait :{" "}
                  <span className="text-[#1C1917] font-medium">
                    {verifiedOrder.relay_point}
                  </span>
                </p>
              ) : (
                <p>
                  Adresse :{" "}
                  <span className="text-[#1C1917] font-medium">
                    {verifiedOrder.address}, {verifiedOrder.postal_code} {verifiedOrder.city}
                  </span>
                </p>
              )}
            </div>

            {verifiedOrder.items.length > 0 && (
              <div className="pt-3 border-t border-[#F2EFE9] space-y-2">
                <p className="font-semibold text-[#1C1917]">Articles commandés :</p>
                {verifiedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span>
                      <strong>{it.qty}×</strong> {it.name} ({it.variant})
                    </span>
                    <span className="font-mono text-[#1C1917] shrink-0">
                      {formatPrice(it.price * it.qty)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-[#F2EFE9] space-y-1">
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>
                  {verifiedOrder.shipping_cost === 0
                    ? "Offert"
                    : formatPrice(verifiedOrder.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-sm text-[#1C1917] pt-1">
                <span>Total réglé TTC</span>
                <span>{formatPrice(verifiedOrder.total)}</span>
              </div>
              <p className="text-[11px] text-[#78716C] text-right">
                TVA non applicable, art. 293 B du CGI
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                openPrintableInvoice({
                  invoiceNumber:
                    verifiedOrder.invoice_number || verifiedOrder.order_number,
                  orderNumber: verifiedOrder.order_number,
                  date: verifiedOrder.date,
                  paidAt: verifiedOrder.paid_at,
                  customerName: verifiedOrder.customer_name,
                  customerEmail: verifiedOrder.customer_email,
                  shippingMethod: verifiedOrder.shipping_method,
                  relayPoint: verifiedOrder.relay_point,
                  address: verifiedOrder.address,
                  postalCode: verifiedOrder.postal_code,
                  city: verifiedOrder.city,
                  items: verifiedOrder.items,
                  subtotal: verifiedOrder.subtotal,
                  shippingCost: verifiedOrder.shipping_cost,
                  total: verifiedOrder.total,
                })
              }
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#E7E2DA] bg-white hover:bg-[#F2EFE9] text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#A16207]" />
              <span>Imprimer ma facture</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#A16207]" />
          <p className="text-sm font-medium text-[#57534E]">Chargement de votre panier...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (isHydrated && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="font-serif text-3xl text-[#1C1917]">Votre panier est vide</h1>
          <p className="text-xs text-[#57534E]">
            Ajoutez des produits à votre panier avant de passer commande.
          </p>
          <div className="pt-4">
            <Link
              href="/boutique"
              className="inline-block px-6 py-3 rounded-xl bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A16207] transition"
            >
              Voir la boutique
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-10 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1C1917] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continuer mes achats</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Paiement Stripe 100% Sécurisé</span>
          </div>
        </div>

        {/* Bannière annulation de paiement Stripe */}
        {statusParam === "cancelled" && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              {cancelledOrderParam ? `Commande #${cancelledOrderParam} — ` : ""}
              Le paiement a été annulé avant finalisation. Votre panier reste intact si vous souhaitez reprendre votre commande.
            </p>
          </div>
        )}

        {/* Bannière incitative livraison offerte */}
        {isFreeShipping ? (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs font-medium">
              Votre commande dépasse 60,00 € :{" "}
              <strong>
                la livraison standard (Mondial Relay &amp; Colissimo) vous est entièrement offerte !
              </strong>
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-[#1C1917] flex items-center justify-between text-xs">
            <span>
              Plus que{" "}
              <strong className="text-[#A16207]">
                {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
              </strong>{" "}
              pour profiter de la <strong>livraison standard offerte</strong> en France.
            </span>
            <Link
              href="/boutique"
              className="text-xs font-semibold text-[#A16207] hover:underline shrink-0 ml-3"
            >
              Ajouter un article →
            </Link>
          </div>
        )}

        {/* Bannière d'erreur de validation ou réseau */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Colonne Gauche : Formulaire Coordonnées & Livraison France */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bannière Connexion / 1-Clic Espace Client */}
            {user ? (
              <div className="p-4 rounded-xl bg-[#F5F2EB] border border-[#E7E2DA] text-[#1C1917] flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#A16207]/10 text-[#A16207] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#A16207] shrink-0 inline" />
                    <span>
                      Connecté(e) en tant que{" "}
                      <strong>
                        {user.firstName} {user.lastName}
                      </strong>{" "}
                      — Vos coordonnées et carnet d&apos;adresses ont été pré-remplis automatiquement.
                    </span>
                  </span>
                </div>
                <Link
                  href="/compte"
                  className="text-xs font-semibold text-[#A16207] hover:underline shrink-0 ml-4 hidden sm:inline"
                >
                  Mon Compte →
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#F5F2EB]/90 border border-[#E7E2DA] text-[#57534E] flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#E7E2DA] text-[#1C1917] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </span>
                  <span>
                    Vous avez un compte Club Parfum ?{" "}
                    <Link
                      href="/compte"
                      className="text-[#A16207] font-semibold underline hover:text-[#1C1917]"
                    >
                      Connectez-vous
                    </Link>{" "}
                    pour pré-remplir vos coordonnées en 1 clic, ou poursuivez directement en tant qu&apos;invité(e).
                  </span>
                </div>
              </div>
            )}

            {/* 1. Contact */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-5 shadow-xs">
              <h2 className="font-serif text-2xl text-[#1C1917]">1. Vos coordonnées</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="checkout-firstname"
                    className="block text-sm font-medium text-[#1C1917] mb-1.5"
                  >
                    Prénom *
                  </label>
                  <input
                    id="checkout-firstname"
                    type="text"
                    required
                    placeholder="Marie"
                    value={formData.firstName}
                    onChange={(e) => updateFormField({ firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-lastname"
                    className="block text-sm font-medium text-[#1C1917] mb-1.5"
                  >
                    Nom *
                  </label>
                  <input
                    id="checkout-lastname"
                    type="text"
                    required
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => updateFormField({ lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="checkout-email"
                    className="block text-sm font-medium text-[#1C1917] mb-1.5"
                  >
                    E-mail *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="marie.dupont@gmail.com"
                    value={formData.email}
                    onChange={(e) => updateFormField({ email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-sm font-medium text-[#1C1917] mb-1.5"
                  >
                    Téléphone de contact (suivi colis) *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="+33 6 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => updateFormField({ phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
              </div>
            </section>

            {/* 2. Mode de Livraison France */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-5 shadow-xs">
              <h2 className="font-serif text-2xl text-[#1C1917]">2. Mode de livraison en France</h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isSelected = selectedShipping.id === method.id;
                  const price = getShippingCost(method);
                  const isFreeMethod = price === 0;

                  return (
                    <label
                      key={method.id}
                      className={`flex items-start justify-between p-4 sm:p-5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? "border-[#A16207] bg-[#A16207]/5 ring-1 ring-[#A16207]"
                          : "border-[#E7E2DA] hover:border-[#1C1917]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={isSelected}
                          onChange={() => setSelectedShipping(method)}
                          className="mt-1 text-[#A16207] focus:ring-[#A16207]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif text-base sm:text-[17px] font-normal text-[#1C1917]">
                              {method.name}
                            </p>
                            {isFreeMethod && (
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Offert dès 60 €
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed mt-1">
                            {method.description}
                          </p>
                          <span className="text-xs text-[#A16207] font-medium block mt-1.5">
                            Délai indicatif : {method.estimated_days}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isFreeMethod ? (
                          <div className="flex flex-col items-end">
                            <span className="font-serif font-bold text-base text-emerald-800">
                              0,00 €
                            </span>
                            <span className="text-xs line-through text-[#57534E]/60">
                              {method.price.toFixed(2)} €
                            </span>
                          </div>
                        ) : (
                          <span className="font-serif font-bold text-base sm:text-lg text-[#1C1917]">
                            {method.price.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Localisation commune (Code postal + Ville) */}
              <div className="pt-4 border-t border-[#F2EFE9] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="checkout-postal-code"
                      className="block text-sm font-medium text-[#1C1917] mb-1.5"
                    >
                      Code Postal (5 chiffres) *
                    </label>
                    <input
                      id="checkout-postal-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      required
                      placeholder="75011"
                      value={formData.postalCode}
                      onChange={(e) => {
                        updateFormField({ postalCode: e.target.value });
                        if (relaySelection) setRelaySelection(null);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-city"
                      className="block text-sm font-medium text-[#1C1917] mb-1.5"
                    >
                      Ville *
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => updateFormField({ city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>
                </div>

                {/* Détails spécifiques selon l'option */}
                {selectedShipping.requires_relay_point ? (
                  <RelayPointPicker
                    postalCode={formData.postalCode}
                    city={formData.city}
                    value={relaySelection}
                    onChange={setRelaySelection}
                    onSuggestCity={(suggestedCity) => {
                      if (!formData.city.trim()) {
                        updateFormField({ city: suggestedCity });
                      }
                    }}
                  />
                ) : (
                  <div className="pt-2 space-y-4">
                    <div>
                      <label
                        htmlFor="checkout-address"
                        className="block text-sm font-medium text-[#1C1917] mb-1.5"
                      >
                        Adresse de livraison *
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        required
                        placeholder="14 Rue des Lilas"
                        value={formData.address}
                        onChange={(e) => updateFormField({ address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="checkout-building"
                          className="block text-sm font-medium text-[#1C1917] mb-1.5"
                        >
                          Bâtiment / Étage (facultatif)
                        </label>
                        <input
                          id="checkout-building"
                          type="text"
                          placeholder="Bât B, 3e étage"
                          value={formData.building}
                          onChange={(e) => updateFormField({ building: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] text-sm text-[#1C1917]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="checkout-digicode"
                          className="block text-sm font-medium text-[#1C1917] mb-1.5"
                        >
                          Digicode / Interphone
                        </label>
                        <input
                          id="checkout-digicode"
                          type="text"
                          placeholder="A1234 / Dupont"
                          value={formData.digicode}
                          onChange={(e) => updateFormField({ digicode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] text-sm text-[#1C1917]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Colonne Droite : Récapitulatif de Commande & Paiement Stripe */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-6 shadow-sm sticky top-28">
              <h2 className="font-serif text-2xl text-[#1C1917]">Récapitulatif ({totalCount})</h2>

              {/* Liste résumée des articles */}
              <ul className="divide-y divide-[#F2EFE9] max-h-64 overflow-y-auto pr-1">
                {items.map((it) => (
                  <li key={it.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2EFE9] shrink-0 border border-[#E7E2DA]">
                        <Image
                          src={it.image}
                          alt={it.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1917] line-clamp-1">{it.name}</p>
                        <p className="text-xs text-[#57534E]">
                          {it.quantity}x • {it.variantLabel}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#1C1917] shrink-0">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totaux */}
              <div className="pt-4 border-t border-[#F2EFE9] space-y-2.5 text-sm text-[#57534E]">
                <div className="flex justify-between">
                  <span>Sous-total articles</span>
                  <span className="font-medium text-[#1C1917]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Livraison ({selectedShipping.name})</span>
                  <span
                    className={`font-medium ${
                      effectiveShippingPrice === 0
                        ? "text-emerald-800 font-semibold"
                        : "text-[#1C1917]"
                    }`}
                  >
                    {effectiveShippingPrice === 0
                      ? "0,00 € (Offert)"
                      : formatPrice(effectiveShippingPrice)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#F2EFE9] flex justify-between items-baseline text-base font-semibold text-[#1C1917]">
                  <span>Total TTC</span>
                  <span className="font-serif text-2xl sm:text-3xl text-[#1C1917]">
                    {formatPrice(totalOrder)}
                  </span>
                </div>
                <p className="text-xs text-[#57534E] text-right">
                  TVA non applicable, art. 293 B du CGI
                </p>
              </div>

              {/* Case à cocher obligatoire d'acceptation des CGV */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#57534E] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={cgvAccepted}
                    onChange={(e) => setCgvAccepted(e.target.checked)}
                    className="mt-0.5 text-[#A16207] focus:ring-[#A16207] rounded-sm cursor-pointer"
                  />
                  <span>
                    J&apos;ai lu et j&apos;accepte sans réserve les{" "}
                    <Link
                      href="/cgv"
                      target="_blank"
                      className="text-[#A16207] underline font-medium hover:text-[#1C1917]"
                    >
                      Conditions Générales de Vente
                    </Link>{" "}
                    et je reconnais l&apos;exception au droit de rétractation pour les cosmétiques descellés. *
                  </span>
                </label>
              </div>

              {/* Bouton de paiement Stripe réel */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-sm font-medium tracking-[0.14em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirection vers Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#A16207]" />
                    <span>
                      Payer par Carte / Apple Pay • {formatPrice(totalOrder)}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-[#57534E] space-y-1">
                <p>
                  Règlement sécurisé par Stripe (Cartes Bancaires, Apple Pay, Google Pay — chiffrement SSL/TLS &amp; 3D Secure).
                </p>
                <p className="text-[11px] text-[#A16207]">
                  Garantie artisanale &amp; facture officielle émise automatiquement
                </p>
              </div>
            </section>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
          <Header />
          <main className="flex-1 max-w-md mx-auto px-4 py-24 text-center flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#A16207]" />
            <p className="text-sm font-medium text-[#57534E]">Chargement du paiement...</p>
          </main>
          <Footer />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
