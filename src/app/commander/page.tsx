"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SHIPPING_METHODS } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, ShippingMethod } from "@/types/store";
import {
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  CreditCard,
  Sparkles,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal, totalCount, clearCart, isHydrated } = useCart();
  const { user, updateProfile } = useAuth();

  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>(SHIPPING_METHODS[0]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrderNumber, setConfirmedOrderNumber] = useState<string>("CP-2026-0043");

  // Données formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    building: "",
    digicode: "",
    postalCode: "75011",
    city: "Paris",
    relayChoice: "",
  });

  // Autocomplétion intelligente en 1 clic si le client est connecté
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || "",
        lastName: prev.lastName || user.lastName || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
        building: prev.building || user.building || "",
        digicode: prev.digicode || user.digicode || "",
        postalCode: prev.postalCode === "75011" && user.postalCode ? user.postalCode : prev.postalCode,
        city: prev.city === "Paris" && user.city ? user.city : prev.city,
      }));
    }
  }, [user]);

  const currentRelay =
    formData.relayChoice.trim() ||
    `Point Relais à proximité (${formData.postalCode.trim() || "France"})`;

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

    // 1. Validation universelle et flexible du numéro de téléphone de contact
    const cleanedPhone = formData.phone.trim();
    if (!cleanedPhone || cleanedPhone.replace(/\s+/g, "").length < 4) {
      setErrorMessage("Veuillez renseigner un numéro de téléphone de contact.");
      return;
    }

    // 2. Validation flexible du code postal et de la ville
    if (!formData.postalCode.trim()) {
      setErrorMessage("Veuillez renseigner votre code postal.");
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage("Veuillez renseigner votre ville.");
      return;
    }

    // 3. Validation de l'adresse de rue si livraison à domicile
    if (!selectedShipping.requires_relay_point) {
      if (!formData.address.trim()) {
        setErrorMessage("Veuillez renseigner votre adresse de livraison.");
        return;
      }
    }

    setIsSubmitting(true);

    const orderNum = `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;

    // 4. Enregistrer la commande dans Supabase avec await et gestion d'erreurs
    if (isSupabaseConfigured && supabase) {
      try {
        // Blindage UUID : Supabase attend un UUID strict pour user_id (évite l'erreur 'invalid input syntax for type uuid')
        const isValidUuid = Boolean(
          user?.id &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)
        );
        const validUserId = isValidUuid ? user!.id : null;

        const orderPayload: Record<string, any> = {
          id: orderId,
          ...(validUserId ? { user_id: validUserId } : {}),
          order_number: orderNum,
          date: new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
          customer_first_name: formData.firstName.trim(),
          customer_last_name: formData.lastName.trim(),
          customer_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          customer_email: formData.email.trim().toLowerCase(),
          customer_phone: cleanedPhone,
          shipping_method_id: selectedShipping.id,
          shipping_method: selectedShipping.name,
          shipping_cost: effectiveShippingPrice,
          relay_point: selectedShipping.requires_relay_point ? currentRelay : null,
          address: selectedShipping.requires_relay_point ? null : formData.address.trim(),
          building: selectedShipping.requires_relay_point ? null : formData.building?.trim() || null,
          digicode: selectedShipping.requires_relay_point ? null : formData.digicode?.trim() || null,
          postal_code: formData.postalCode.trim(),
          city: formData.city.trim(),
          subtotal: Number(subtotal),
          total: Number(totalOrder),
          status: "pending",
          tracking: "",
          items: items.map((it) => ({
            name: it.name,
            variant: it.variantLabel,
            qty: it.quantity,
            price: Number(it.price),
          })),
        };

        let { error } = await supabase.from("orders").insert(orderPayload);

        // Fallback automatique si la colonne user_id n'existe pas encore dans la table distante
        if (error && "user_id" in orderPayload) {
          console.warn("Échec insertion avec user_id, repli sans user_id:", error.message);
          const { user_id, ...payloadWithoutUserId } = orderPayload;
          const retry = await supabase.from("orders").insert(payloadWithoutUserId);
          error = retry.error;
        }

        if (error) {
          console.error("Erreur enregistrement commande Supabase:", error);
          setErrorMessage(
            "Une erreur technique est survenue lors de l'enregistrement de votre commande. Veuillez réessayer."
          );
          setIsSubmitting(false);
          return;
        }

        // Si le client est connecté, synchroniser et compléter automatiquement son Carnet d'Adresses
        if (user) {
          const profileUpdates: Partial<typeof user> = {};
          if (!user.address && formData.address) profileUpdates.address = formData.address.trim();
          if (!user.building && formData.building) profileUpdates.building = formData.building.trim();
          if (!user.digicode && formData.digicode) profileUpdates.digicode = formData.digicode.trim();
          if ((!user.postalCode || user.postalCode === "75011") && formData.postalCode) {
            profileUpdates.postalCode = formData.postalCode.trim();
          }
          if ((!user.city || user.city === "Paris") && formData.city) {
            profileUpdates.city = formData.city.trim();
          }
          if (!user.phone && cleanedPhone) profileUpdates.phone = cleanedPhone;

          if (Object.keys(profileUpdates).length > 0) {
            updateProfile(profileUpdates).catch((err) => console.warn("Erreur auto-sauvegarde profil:", err));
          }
        }
      } catch (err) {
        console.error("Erreur réseau Supabase:", err);
        setErrorMessage(
          "Impossible d'établir la connexion sécurisée avec la base de données. Veuillez vérifier votre réseau."
        );
        setIsSubmitting(false);
        return;
      }
    }

    setConfirmedOrderNumber(orderNum);
    setIsSubmitted(true);
    setIsSubmitting(false);
    clearCart();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block">
            Commande Confirmée • #{confirmedOrderNumber}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917]">
            Merci pour votre commande, {formData.firstName} !
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-lg mx-auto font-light">
            Un e-mail de confirmation récapitulant vos articles et le suivi de livraison a été envoyé à{" "}
            <strong className="text-[#1C1917]">{formData.email}</strong>. Vos créations artisanales de Grasse sont en cours de préparation.
          </p>

          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] max-w-md mx-auto text-left space-y-3 text-xs text-[#57534E]">
            <p className="font-semibold text-[#1C1917]">Détails de l&apos;expédition :</p>
            <p>
              Mode : <span className="font-medium text-[#A16207]">{selectedShipping.name}</span>
            </p>
            {selectedShipping.requires_relay_point ? (
              <p>
                Lieu de retrait : <span className="text-[#1C1917] font-medium">{formData.relayChoice}</span>
              </p>
            ) : (
              <p>
                Adresse :{" "}
                <span className="text-[#1C1917] font-medium">
                  {formData.address}, {formData.postalCode} {formData.city}
                </span>
              </p>
            )}
            <p className="pt-2 border-t border-[#F2EFE9] flex justify-between font-semibold text-sm text-[#1C1917]">
              <span>Total réglé</span>
              <span>{formatPrice(totalOrder)}</span>
            </p>
          </div>

          <div className="pt-4">
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

  if (isHydrated && items.length === 0 && !isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-md mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="font-serif text-3xl text-[#1C1917]">Votre panier est vide</h1>
          <p className="text-xs text-[#57534E]">Ajoutez des produits à votre panier avant de passer commande.</p>
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
            <span className="font-medium">Paiement SSL 100% Sécurisé</span>
          </div>
        </div>

        {/* Bannière incitative livraison offerte */}
        {isFreeShipping ? (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
            <p className="text-xs font-medium">
              Votre commande dépasse 60,00 € : <strong>la livraison standard (Mondial Relay & Colissimo) vous est entièrement offerte !</strong>
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-[#1C1917] flex items-center justify-between text-xs">
            <span>
              Plus que <strong className="text-[#A16207]">{formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}</strong> pour profiter de la <strong>livraison standard offerte</strong> en France.
            </span>
            <Link href="/boutique" className="text-xs font-semibold text-[#A16207] hover:underline shrink-0 ml-3">
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
                      Connecté(e) en tant que <strong>{user.firstName} {user.lastName}</strong> — Vos coordonnées et carnet d&apos;adresses ont été pré-remplis automatiquement.
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
                    <Link href="/compte" className="text-[#A16207] font-semibold underline hover:text-[#1C1917]">
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
                  <label htmlFor="checkout-firstname" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    Prénom *
                  </label>
                  <input
                    id="checkout-firstname"
                    type="text"
                    required
                    placeholder="Marie"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-lastname" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    Nom *
                  </label>
                  <input
                    id="checkout-lastname"
                    type="text"
                    required
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-email" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    E-mail *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="marie.dupont@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    Téléphone de contact (suivi colis) *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="+33 6 12 34 56 78 ou numéro international"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            <p className="font-serif text-base sm:text-[17px] font-normal text-[#1C1917]">{method.name}</p>
                            {isFreeMethod && (
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Offert dès 60 €
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed mt-1">{method.description}</p>
                          <span className="text-xs text-[#A16207] font-medium block mt-1.5">
                            Délai indicatif : {method.estimated_days}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {isFreeMethod ? (
                          <div className="flex flex-col items-end">
                            <span className="font-serif font-bold text-base text-emerald-800">0,00 €</span>
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
                    <label htmlFor="checkout-postal-code" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                      Code Postal *
                    </label>
                    <input
                      id="checkout-postal-code"
                      type="text"
                      required
                      placeholder="75011"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-city" className="block text-sm font-medium text-[#1C1917] mb-1.5">Ville *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      placeholder="Paris"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>
                </div>

                {/* Détails spécifiques selon l'option */}
                {selectedShipping.requires_relay_point ? (
                  <div className="pt-2 space-y-2">
                    <label htmlFor="checkout-relay" className="block text-sm font-medium text-[#1C1917]">
                      Nom ou adresse du commerce / Locker souhaité (Optionnel)
                    </label>
                    <input
                      id="checkout-relay"
                      type="text"
                      placeholder="Ex : Locker Mondial Relay 24/7 Gare, Presse & Tabac du Centre..."
                      value={formData.relayChoice}
                      onChange={(e) => setFormData({ ...formData, relayChoice: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm bg-white text-[#1C1917]"
                    />
                    <p className="text-xs text-[#57534E]">
                      Un conseiller vérifiera le Point Relais le plus proche de votre code postal avant expédition.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4">
                    <div>
                      <label htmlFor="checkout-address" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                        Adresse de livraison *
                      </label>
                      <input
                        id="checkout-address"
                        type="text"
                        required
                        placeholder="14 Rue des Lilas"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-building" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                          Bâtiment / Étage (facultatif)
                        </label>
                        <input
                          id="checkout-building"
                          type="text"
                          placeholder="Bât B, 3e étage"
                          value={formData.building}
                          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] text-sm text-[#1C1917]"
                        />
                      </div>
                      <div>
                        <label htmlFor="checkout-digicode" className="block text-sm font-medium text-[#1C1917] mb-1.5">
                          Digicode / Interphone
                        </label>
                        <input
                          id="checkout-digicode"
                          type="text"
                          placeholder="A1234 / Dupont"
                          value={formData.digicode}
                          onChange={(e) => setFormData({ ...formData, digicode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] text-sm text-[#1C1917]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Colonne Droite : Récapitulatif de Commande & Paiement */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-6 shadow-sm sticky top-28">
              <h2 className="font-serif text-2xl text-[#1C1917]">Récapitulatif ({totalCount})</h2>

              {/* Liste résumée des articles */}
              <ul className="divide-y divide-[#F2EFE9] max-h-64 overflow-y-auto pr-1">
                {items.map((it) => (
                  <li key={it.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2EFE9] shrink-0 border border-[#E7E2DA]">
                        <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1917] line-clamp-1">{it.name}</p>
                        <p className="text-xs text-[#57534E]">{it.quantity}x • {it.variantLabel}</p>
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
                      effectiveShippingPrice === 0 ? "text-emerald-800 font-semibold" : "text-[#1C1917]"
                    }`}
                  >
                    {effectiveShippingPrice === 0 ? "0,00 € (Offert)" : formatPrice(effectiveShippingPrice)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#F2EFE9] flex justify-between items-baseline text-base font-semibold text-[#1C1917]">
                  <span>Total TTC</span>
                  <span className="font-serif text-2xl sm:text-3xl text-[#1C1917]">{formatPrice(totalOrder)}</span>
                </div>
                <p className="text-xs text-[#57534E] text-right">TVA non applicable, art. 293 B du CGI</p>
              </div>

              {/* Case à cocher obligatoire d'acceptation des CGV */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#57534E] cursor-pointer">
                  <input
                    type="checkbox"
                    required
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

              {/* Bouton de confirmation avec simulation de commande */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-sm font-medium tracking-[0.14em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement de la commande...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#A16207]" />
                    <span>Confirmer la commande (Simulation de paiement) • {formatPrice(totalOrder)}</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-[#57534E] space-y-1">
                <p>Mode Démo : La commande sera enregistrée sans débit bancaire immédiat. Vos informations restent strictement confidentielles.</p>
                <p className="text-[11px] text-[#A16207]">Garantie artisanale &amp; suivi de colis en direct</p>
              </div>
            </section>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}
