"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { SHIPPING_METHODS } from "@/data/mock-data";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Lock, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, subtotal, totalCount, clearCart } = useCart();
  
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_METHODS[0]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Données formulaire
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    building: "",
    digicode: "",
    postalCode: "",
    city: "",
    relayChoice: "Tabac Presse des Fleurs - 75011 Paris (Point Relais recommandé)",
  });

  const totalOrder = subtotal + selectedShipping.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    clearCart();
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block">
            Commande Confirmée • #CP-2026-0043
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917]">
            Merci pour votre commande, {formData.firstName} !
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-lg mx-auto font-light">
            Un e-mail de confirmation récapitulant vos articles et le suivi de livraison a été envoyé à <strong className="text-[#1C1917]">{formData.email}</strong>. Vos bougies et parfums sont en cours de préparation artisanale.
          </p>

          <div className="p-6 bg-white rounded-2xl border border-[#E7E2DA] max-w-md mx-auto text-left space-y-3 text-xs text-[#57534E]">
            <p className="font-semibold text-[#1C1917]">Détails de l'expédition :</p>
            <p>Mode : <span className="font-medium text-[#A16207]">{selectedShipping.name}</span></p>
            {selectedShipping.requires_relay_point ? (
              <p>Lieu de retrait : <span className="text-[#1C1917] font-medium">{formData.relayChoice}</span></p>
            ) : (
              <p>Adresse : <span className="text-[#1C1917] font-medium">{formData.address}, {formData.postalCode} {formData.city}</span></p>
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
              <span>Retour à l'accueil</span>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Colonne Gauche : Formulaire Coordonnées & Livraison France */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
              <h2 className="font-serif text-2xl text-[#1C1917]">1. Vos coordonnées</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Marie"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dupont"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="marie.dupont@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">Téléphone (pour le transporteur) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="06 12 34 56 78"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                  />
                </div>
              </div>
            </section>

            {/* 2. Mode de Livraison France */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
              <h2 className="font-serif text-2xl text-[#1C1917]">2. Mode de livraison en France</h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((method) => {
                  const isSelected = selectedShipping.id === method.id;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-start justify-between p-4 rounded-xl border cursor-pointer transition ${
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
                          <p className="font-semibold text-xs text-[#1C1917]">{method.name}</p>
                          <p className="text-[11px] text-[#57534E] leading-relaxed">{method.description}</p>
                          <span className="text-[10px] text-[#A16207] font-medium block mt-0.5">
                            Délai : {method.estimated_days}
                          </span>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-sm text-[#1C1917] shrink-0">
                        {method.price.toFixed(2)} €
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Détails d'adresse selon l'option */}
              {selectedShipping.requires_relay_point ? (
                <div className="pt-3 border-t border-[#F2EFE9] space-y-2">
                  <label className="block text-xs font-medium text-[#1C1917]">Point Relais sélectionné</label>
                  <select
                    value={formData.relayChoice}
                    onChange={(e) => setFormData({ ...formData, relayChoice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs bg-white"
                  >
                    <option value="Tabac Presse des Fleurs - 75011 Paris (Point Relais)">Tabac Presse des Fleurs - 75011 Paris (0.2 km)</option>
                    <option value="Épicerie Fine République - 75003 Paris">Épicerie Fine République - 75003 Paris (0.5 km)</option>
                    <option value="Locker Mondial Relay 24/7 - Métro Voltaire">Locker Mondial Relay 24/7 - Métro Voltaire (0.6 km)</option>
                  </select>
                </div>
              ) : (
                <div className="pt-3 border-t border-[#F2EFE9] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Adresse de livraison *</label>
                    <input
                      type="text"
                      required
                      placeholder="14 Rue des Lilas"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#1C1917] mb-1">Bâtiment / Étage (facultatif)</label>
                      <input
                        type="text"
                        placeholder="Bât B, 3e étage"
                        value={formData.building}
                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1C1917] mb-1">Digicode / Interphone</label>
                      <input
                        type="text"
                        placeholder="A1234 / Dupont"
                        value={formData.digicode}
                        onChange={(e) => setFormData({ ...formData, digicode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#1C1917] mb-1">Code Postal (5 chiffres) *</label>
                      <input
                        type="text"
                        pattern="[0-9]{5}"
                        required
                        placeholder="75011"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#1C1917] mb-1">Ville *</label>
                      <input
                        type="text"
                        required
                        placeholder="Paris"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Colonne Droite : Récapitulatif de Commande & Paiement */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-6 shadow-sm sticky top-28">
              <h2 className="font-serif text-2xl text-[#1C1917]">Récapitulatif ({totalCount})</h2>

              {/* Liste résumée des articles */}
              <ul className="divide-y divide-[#F2EFE9] max-h-64 overflow-y-auto pr-1">
                {items.map((it) => (
                  <li key={it.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2EFE9] shrink-0 border border-[#E7E2DA]">
                        <Image src={it.image} alt={it.name} fill className="object-cover" unoptimized />
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1917] line-clamp-1">{it.name}</p>
                        <p className="text-[11px] text-[#57534E]">{it.quantity}x • {it.variantLabel}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[#1C1917] shrink-0">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Totaux */}
              <div className="pt-4 border-t border-[#F2EFE9] space-y-2 text-xs text-[#57534E]">
                <div className="flex justify-between">
                  <span>Sous-total articles</span>
                  <span className="font-medium text-[#1C1917]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison ({selectedShipping.name})</span>
                  <span className="font-medium text-[#1C1917]">{formatPrice(selectedShipping.price)}</span>
                </div>
                <div className="pt-2 border-t border-[#F2EFE9] flex justify-between items-baseline text-sm font-semibold text-[#1C1917]">
                  <span>Total TTC</span>
                  <span className="font-serif text-2xl text-[#1C1917]">{formatPrice(totalOrder)}</span>
                </div>
                <p className="text-[10px] text-[#57534E] text-right">TVA non applicable, art. 293 B du CGI</p>
              </div>

              {/* Case à cocher obligatoire d'acceptation des CGV (Droit français de la consommation) */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-[#57534E] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 text-[#A16207] focus:ring-[#A16207] rounded-sm"
                  />
                  <span>
                    J'ai lu et j'accepte sans réserve les{" "}
                    <Link href="/cgv" target="_blank" className="text-[#A16207] underline font-medium hover:text-[#1C1917]">
                      Conditions Générales de Vente
                    </Link>{" "}
                    et je reconnais l'exception au droit de rétractation pour les cosmétiques descellés. *
                  </span>
                </label>
              </div>

              {/* Bouton Payer */}
              <button
                type="submit"
                className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Payer {formatPrice(totalOrder)}</span>
              </button>

              <div className="text-center text-[11px] text-[#57534E] space-y-1">
                <p>Cartes Bancaires (CB), Apple Pay, PayPal & Wero</p>
                <p className="text-[10px] text-[#A16207]">Garantie satisfait ou remboursé 14 jours</p>
              </div>
            </section>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}
