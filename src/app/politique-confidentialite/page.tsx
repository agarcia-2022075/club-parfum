import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, Database, Cookie, Mail } from "lucide-react";

export const metadata = {
  title: "Politique de Confidentialité & Cookies | Club Parfum",
  description: "Protection de la vie privée, conformité RGPD et gestion des données personnelles sur Club Parfum.",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-xs text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">Politique de Confidentialité</span>
        </nav>

        <header className="mb-12 border-b border-[#E7E2DA] pb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Respect de la Vie Privée
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Politique de Confidentialité & RGPD
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
            Club Parfum s'engage à protéger la confidentialité de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi Informatique et Libertés.
          </p>
        </header>

        <div className="space-y-8 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
          
          {/* Données collectées */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Database className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">1. Données Personnelles Collectées</h2>
            </div>
            <p>
              Nous collectons uniquement les informations strictement nécessaires à la bonne exécution de vos commandes en ligne :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#1C1917]">
              <li><strong>Identité :</strong> Nom, prénom.</li>
              <li><strong>Coordonnées :</strong> Adresse postale de livraison et de facturation en France métropolitaine, code d'accès / digicode, adresse e-mail et numéro de téléphone mobile.</li>
              <li><strong>Historique de commande :</strong> Produits commandés, date, montant et statut d'expédition.</li>
              <li><strong>Données de paiement :</strong> Gérées de manière chiffrée et externalisée par nos partenaires Stripe et PayPal. Aucune coordonnée bancaire n'est conservée par Club Parfum.</li>
            </ul>
          </section>

          {/* Finalités */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Eye className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">2. Finalités et Destinataires des Données</h2>
            </div>
            <p>Vos données sont exclusivement utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1 text-[#1C1917]">
              <li>Le traitement et la préparation artisanale de vos commandes.</li>
              <li>L'expédition de vos colis et l'envoi du numéro de suivi par Mondial Relay ou La Poste Colissimo.</li>
              <li>La gestion du service après-vente et le conseil olfactif personnalisé par e-mail ou WhatsApp.</li>
            </ul>
            <p className="pt-2">
              <strong>Nous ne vendons, ne louons et ne cédons aucune de vos données personnelles à des tiers à des fins publicitaires ou commerciales.</strong>
            </p>
          </section>

          {/* Durée de conservation */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-2xl text-[#1C1917] font-normal">3. Durée de Conservation des Données</h2>
            <p>
              Les données clients sont conservées pendant la durée de la relation commerciale, puis archivées pendant une durée de 5 ans à des fins probatoires, ou 10 ans pour les factures conformément aux obligations du Code de commerce français.
            </p>
          </section>

          {/* Cookies */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Cookie className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">4. Utilisation des Cookies et Traceurs</h2>
            </div>
            <p>
              Le site Club Parfum utilise exclusivement des cookies fonctionnels et techniques strictement indispensables au fonctionnement de la boutique (gestion du panier d'achat, maintien de session et sécurité).
            </p>
            <p>
              Conformément aux recommandations de la CNIL, ces traceurs fonctionnels ne nécessitent pas de consentement préalable car ils ne réalisent aucun pistage publicitaire intrusif.
            </p>
          </section>

          {/* Vos droits */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Mail className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">5. Vos Droits (Accès, Rectification, Suppression)</h2>
            </div>
            <p>
              Conformément à la réglementation européenne, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de l'ensemble de vos données personnelles.
            </p>
            <p>
              Pour exercer ces droits, vous pouvez nous adresser un simple message accompagné d'un justificatif d'identité à l'adresse suivante : <strong className="text-[#1C1917]">contact@clubparfum.fr</strong>. Vous disposez également du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL - www.cnil.fr).
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
