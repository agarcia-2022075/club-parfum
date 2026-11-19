import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RetractationFormClient } from "@/app/politique-retractation/RetractationFormClient";
import { STORE_CONFIG, getLegalFieldOrFallback } from "@/lib/store-config";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique & Formulaire de Rétractation | Club Parfum",
  description:
    "Exercez votre droit de rétractation sous 14 jours conformément au Code de la consommation pour vos commandes Club Parfum.",
};

export default function RetractationPage() {
  const addressDisplay = getLegalFieldOrFallback(STORE_CONFIG.legal.address);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-sm text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">Droit de Rétractation</span>
        </nav>

        <header className="mb-12 border-b border-[#E7E2DA] pb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Garantie Sérénité 14 Jours
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Politique &amp; Formulaire de Rétractation
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#57534E] leading-relaxed font-normal">
            Conformément aux articles L.221-18 et suivants du Code de la consommation, vous disposez d&apos;un délai légal de 14 jours pour changer d&apos;avis sans pénalité.
          </p>
        </header>

        <div className="space-y-8 text-sm sm:text-base text-[#44403C] leading-relaxed font-normal">
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

            <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900">
              <li>
                <strong>Eaux de parfum &amp; Diffuseurs :</strong> Le flacon doit être strictement intact, non descellé, jamais vaporisé et dans son emballage d&apos;origine scellé.
              </li>
              <li>
                <strong>Bougies parfumées :</strong> La mèche doit être intacte (bougie jamais allumée) et la cire 100% propre exempte de poussière ou de manipulation.
              </li>
              <li>
                <strong>Frais de retour :</strong> Les frais postaux de retour sont à la charge de l&apos;acheteur.
              </li>
            </ul>
          </section>

          {/* Formulaire de rétractation interactif connecté */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-6 shadow-xs">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-[#A16207] font-semibold block mb-1">
                Démarche Simplifiée
              </span>
              <h2 className="font-serif text-2xl text-[#1C1917] font-normal">
                Formulaire de Rétractation en Ligne
              </h2>
              <p className="text-sm text-[#57534E] mt-1 font-normal">
                Remplissez ce formulaire pour nous notifier immédiatement votre souhait de rétractation. Une référence de dossier et les instructions de retour vous seront envoyées par e-mail.
              </p>
            </div>

            <RetractationFormClient />
          </section>

          {/* Modèle de courrier type légal (Annexe Code de la consommation) */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Modèle de Formulaire Type (Courrier Postal)
            </h2>
            <p className="text-sm text-[#57534E]">
              Si vous préférez notifier votre rétractation par voie postale, vous pouvez recopier le texte suivant et le faire parvenir à l&apos;adresse de l&apos;atelier :
            </p>
            <div className="p-5 bg-[#F2EFE9] rounded-xl text-sm font-mono text-[#44403C] leading-relaxed whitespace-pre-line border border-[#E7E2DA]">
              {`À l'attention de ${STORE_CONFIG.brandName} — ${addressDisplay} (${STORE_CONFIG.contactEmail} / Tél : ${STORE_CONFIG.contactPhone}) :

Je vous notifie par la présente ma rétractation du contrat portant sur la vente du/des bien(s) ci-dessous :
- Produit(s) scellé(s) concerné(s) : ................................................................
- Date de commande : ... / ... / 202... • Date de réception : ... / ... / 202...
- Nom et Prénom du client : ................................................................
- Adresse de livraison du client : ................................................................
- Date et Signature du consommateur`}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
