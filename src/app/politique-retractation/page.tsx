"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { RotateCcw, AlertTriangle, Send, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";

export default function RetractationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-xs text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">Droit de Rétractation</span>
        </nav>

        <header className="mb-12 border-b border-[#E7E2DA] pb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Garantie Sérénité 14 Jours
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Politique & Formulaire de Rétractation
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
            Conformément aux articles L.221-18 et suivants du Code de la consommation, vous disposez d'un délai légal de 14 jours pour changer d'avis sans pénalité.
          </p>
        </header>

        <div className="space-y-8 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
          
          {/* Avertissement Hygiène & Cosmétiques */}
          <section className="p-6 sm:p-8 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-950 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-amber-950 font-normal">
                Conditions de retour pour nos parfums et bougies
              </h2>
            </div>
            
            <p>
              Pour que votre retour soit accepté et intégralement remboursé, les articles doivent respecter les règles de sécurité sanitaire (Article L.221-28 du Code de la consommation) :
            </p>

            <ul className="list-disc pl-5 space-y-1.5 text-xs text-amber-900">
              <li>
                <strong>Eaux de parfum & Diffuseurs :</strong> Le flacon doit être strictement intact, non descellé, jamais vaporisé et dans son emballage d'origine scellé.
              </li>
              <li>
                <strong>Bougies parfumées :</strong> La mèche doit être intacte (bougie jamais allumée) et la cire 100% propre exempte de poussière ou de manipulation.
              </li>
              <li>
                <strong>Frais de retour :</strong> Les frais postaux de retour sont à la charge de l'acheteur.
              </li>
            </ul>
          </section>

          {/* Formulaire de rétractation interactif en ligne */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-6 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#A16207] font-semibold block mb-1">
                Démarche Simplifiée
              </span>
              <h2 className="font-serif text-2xl text-[#1C1917] font-normal">
                Formulaire de Rétractation en Ligne
              </h2>
              <p className="text-xs text-[#57534E] mt-1">
                Remplissez ce formulaire pour nous notifier immédiatement votre souhait de rétractation. Une étiquette et les instructions de retour vous seront envoyées par e-mail.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <h3 className="font-serif text-xl text-emerald-950">Demande de retour enregistrée</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Votre demande pour la commande <strong>#{orderNumber}</strong> a bien été prise en compte. Nous vous avons transmis l'adresse postale de l'atelier pour renvoyer le colis intact.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Numéro de Commande *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : CP-2026-0042"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#1C1917] mb-1">Nom et Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sophie Martin"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">Adresse E-mail de la commande *</label>
                  <input
                    type="email"
                    required
                    placeholder="sophie.martin@example.fr"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1C1917] mb-1">Motif du retour (facultatif)</label>
                  <textarea
                    rows={3}
                    placeholder="Précisez ici les produits concernés ou vos remarques éventuelles..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E2DA] focus:border-[#A16207] focus:outline-none text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto min-h-[44px] px-8 py-3 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold tracking-wider uppercase transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Transmettre ma rétractation</span>
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Modèle de courrier type légal (Annexe Code de la consommation) */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Modèle de Formulaire Type (Courrier Postal)
            </h2>
            <p>
              Si vous préférez notifier votre rétractation par voie postale, vous pouvez recopier le texte suivant et le faire parvenir à l'adresse du siège figurant dans nos mentions légales :
            </p>
            <div className="p-4 bg-[#F2EFE9] rounded-xl text-xs font-mono text-[#57534E] leading-relaxed whitespace-pre-line">
              {`À l'attention de Club Parfum, [Adresse postale en France] (contact@clubparfum.fr) :

Je vous notifie par la présente ma rétractation du contrat portant sur la vente du/des bien(s) ci-dessous :
- Produit(s) : [Indiquer les références]
- Commandé le : [Date] / Reçu le : [Date]
- Nom du consommateur : [Nom et Prénom]
- Adresse du consommateur : [Adresse complète]
- Date et Signature (en cas de notification sur papier)`}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
