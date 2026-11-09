"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
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
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal, totalCount, clearCart } = useCart();

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

  const activePostal = formData.postalCode.trim() || "75011";
  const activeCity = formData.city.trim() || "Paris";
  const dynamicRelayOptions = [
    `Presse & Tabac de la Fontaine - ${activePostal} ${activeCity} (0.3 km - Conseillé)`,
    `Épicerie Fine & Terroir - ${activePostal} ${activeCity} (0.6 km)`,
    `Locker Mondial Relay 24/7 - ${activePostal} ${activeCity} (0.9 km)`,
  ];

  const currentRelay = formData.relayChoice || dynamicRelayOptions[0];

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

    // 1. Validation du numéro de téléphone français
    const cleanedPhone = formData.phone.trim();
    const frenchPhoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!frenchPhoneRegex.test(cleanedPhone)) {
      setErrorMessage(
        "Veuillez renseigner un numéro de téléphone français valide (ex : 06 12 34 56 78 ou +33 6 12 34 56 78)."
      );
      return;
    }

    // 2. Validation du code postal français (5 chiffres) et de la ville
    const postalCodeRegex = /^\d{5}$/;
    if (!postalCodeRegex.test(formData.postalCode.trim())) {
      setErrorMessage("Le code postal français doit comporter exactement 5 chiffres (ex : 75011, 06130).");
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
        const orderPayload = {
          id: orderId,
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

        const { error } = await supabase.from("orders").insert(orderPayload);

        if (error) {
          console.error("Erreur enregistrement commande Supabase:", error);
          setErrorMessage(
            "Une erreur technique est survenue lors de l'enregistrement de votre commande. Veuillez réessayer."
          );
          setIsSubmitting(false);
          return;
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

  if (items.length === 0) {
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
            {/* 1. Contact */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-5 shadow-xs">
              <h2 className="font-serif text-2xl text-[#1C1917]">1. Vos coordonnées</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Marie"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Nom *</label>
                  <input
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
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="marie.dupont@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                    Téléphone français (suivi colis) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="06 12 34 56 78"
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
                    <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                      Code Postal (5 chiffres) *
                    </label>
                    <input
                      type="text"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      required
                      placeholder="75011"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm text-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1.5">Ville *</label>
                    <input
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
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-[#1C1917]">
                        Point Relais disponible autour de {activePostal} {activeCity} *
                      </label>
                      <span className="text-xs text-[#A16207]">3 points trouvés</span>
                    </div>
                    <select
                      value={currentRelay}
                      onChange={(e) => setFormData({ ...formData, relayChoice: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-sm bg-white text-[#1C1917]"
                    >
                      {dynamicRelayOptions.map((opt, i) => (
                        <option key={i} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#57534E]">
                      Votre colis y sera mis à disposition pendant 8 jours ouvrés dès sa réception.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                        Adresse de livraison *
                      </label>
                      <input
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
                        <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                          Bâtiment / Étage (facultatif)
                        </label>
                        <input
                          type="text"
                          placeholder="Bât B, 3e étage"
                          value={formData.building}
                          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E2DA] text-sm text-[#1C1917]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#1C1917] mb-1.5">
                          Digicode / Interphone
                        </label>
                        <input
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
                        <Image src={it.image} alt={it.name} fill className="object-cover" unoptimized />
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

              {/* Bouton Payer avec état de chargement */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] disabled:bg-neutral-600 disabled:cursor-not-allowed text-white text-sm font-medium tracking-[0.14em] uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validation de votre commande...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Régler la commande • {formatPrice(totalOrder)}</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-[#57534E] space-y-1">
                <p>Cartes Bancaires (CB), Apple Pay, PayPal & Wero</p>
                <p className="text-[11px] text-[#A16207]">Garantie satisfait ou remboursé 14 jours</p>
              </div>
            </section>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}
