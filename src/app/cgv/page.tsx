import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { FileText, ShieldCheck, Truck, RotateCcw, HelpCircle, AlertTriangle, Scale } from "lucide-react";

export const metadata = {
  title: "Conditions Générales de Vente (CGV) | Club Parfum",
  description: "Conditions Générales de Vente régissant les achats de bougies et parfums sur le site Club Parfum en France.",
};

export default function CGVPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-xs text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">Conditions Générales de Vente</span>
        </nav>

        <header className="mb-12 border-b border-[#E7E2DA] pb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Cadre Contractuel B2C
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Conditions Générales de Vente
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
            En vigueur au 1er janvier 2026. Applicables aux commandes passées sur la boutique en ligne Club Parfum à destination de la France métropolitaine.
          </p>
        </header>

        <div className="space-y-8 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
          
          {/* Article 1 : Objet et Champ d'application */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 1 • Objet et Champ d'Application
            </h2>
            <p>
              Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent de plein droit l'ensemble des ventes de produits (bougies parfumées, eaux de parfum, diffuseurs et accessoires pour la maison) conclues entre la micro-entreprise <strong className="text-[#1C1917]">Club Parfum</strong> (l'« Éditeur » ou le « Vendeur ») et toute personne physique non professionnelle agissant en qualité de consommateur (l'« Acheteur » ou le « Client ») via le site internet accessible à l'adresse officielle de Club Parfum.
            </p>
            <p>
              Toute commande passée sur le site implique l'adhésion entière, sans réserve et préalable de l'Acheteur aux présentes CGV, qu'il reconnaît avoir lues et acceptées avant de procéder au règlement.
            </p>
          </section>

          {/* Article 2 : Produits et Caractéristiques */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 2 • Produits, Cires et Pyramides Olfactives
            </h2>
            <p>
              Les produits proposés à la vente sont ceux figurant sur le site au jour de la consultation, dans la limite des stocks disponibles. Chaque article fait l'objet d'un descriptif détaillé mentionnant ses caractéristiques essentielles : contenance, temps de brûle approximatif pour les bougies végétales, notes olfactives et conseils d'utilisation.
            </p>
            <p>
              Les photographies illustrant les créations sont fidèles mais ne peuvent assurer une similitude parfaite avec le produit artisanal livré, notamment en ce qui concerne les légères nuances de cires naturelles de soja ou de colza coulées à la main.
            </p>
          </section>

          {/* Article 3 : Prix et Franchise en base de TVA */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 3 • Prix et Clause Fiscale Obligatoire
            </h2>
            <p>
              Les prix de nos créations sont indiqués en euros (€) Toutes Taxes Comprises (TTC), hors participation forfaitaire aux frais d'expédition et d'emballage.
            </p>
            <div className="p-4 bg-[#F2EFE9] rounded-xl border border-[#E7E2DA] text-[#1C1917]">
              <p className="font-semibold text-xs sm:text-sm">
                Mention légale obligatoire (Régime fiscal des micro-entreprises) :
              </p>
              <p className="text-xs text-[#A16207] font-medium mt-1">
                « TVA non applicable, article 293 B du Code Général des Impôts (CGI). »
              </p>
            </div>
            <p>
              Le Vendeur se réserve le droit de modifier ses prix à tout moment. Toutefois, les produits seront facturés sur la base des tarifs en vigueur au moment de la confirmation de la commande par l'Acheteur.
            </p>
          </section>

          {/* Article 4 : Commande et Processus d'Achat */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 4 • Prise de Commande et Validation
            </h2>
            <p>Pour passer commande, le Client suit le processus en ligne :</p>
            <ol className="list-decimal pl-5 space-y-1.5 text-[#1C1917]">
              <li>Sélection des articles et formats désirés dans le panier.</li>
              <li>Vérification du contenu du panier et clic sur « Valider la commande ».</li>
              <li>Renseignement des coordonnées du destinataire en France (nom, prénom, e-mail, téléphone, digicode/bâtiment).</li>
              <li>Choix du mode d'expédition (Point Relais Mondial Relay ou Colissimo Domicile).</li>
              <li>Acceptation expresse des présentes CGV via la case à cocher.</li>
              <li>Règlement sécurisé par carte bancaire ou PayPal.</li>
            </ol>
            <p>
              Une confirmation électronique récapitulative est adressée sans délai à l'adresse e-mail renseignée par le Client.
            </p>
          </section>

          {/* Article 5 : Modalités de Paiement Sécurisé */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 5 • Paiement et Sécurité des Transactions
            </h2>
            <p>
              Le paiement est exigible immédiatement à la commande. Le règlement s'effectue en ligne par carte bancaire (Carte Bleue, Visa, Mastercard, American Express, Apple Pay, Google Pay) via la plateforme certifiée <strong>Stripe</strong> ou par <strong>PayPal</strong> et le réseau bancaire européen <strong>Wero</strong>.
            </p>
            <p>
              Aucune donnée bancaire n'est stockée ni ne transite en clair sur les serveurs de Club Parfum. Le paiement contre remboursement (paiement à la livraison) n'est pas accepté.
            </p>
          </section>

          {/* Article 6 : Expédition et Livraison en France */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 6 • Modalités de Livraison en France Métropolitaine
            </h2>
            <p>
              Les livraisons s'effectuent exclusivement en France métropolitaine via :
            </p>
            <ul className="space-y-1.5 pl-4 border-l-2 border-[#A16207]/40 text-[#1C1917]">
              <li><strong>Point Relais (Mondial Relay) :</strong> 4,50 € — Mise à disposition sous 3 à 5 jours ouvrés dans le commerce choisi. Le colis reste disponible 8 jours calendaires.</li>
              <li><strong>Colissimo Domicile (La Poste) :</strong> 6,90 € — Livraison directe en boîte aux lettres sous 48h à 72h ouvrées.</li>
              <li><strong>Livraison Express (Chronopost / Expert) :</strong> 11,90 € — Remise contre signature sous 24h à 48h.</li>
            </ul>
            <p>
              Les délais de livraison sont indiqués à titre indicatif selon les données des transporteurs. En cas de dépassement de plus de 30 jours non imputable à un cas de force majeure, le Client peut solliciter la résolution de la vente et son remboursement intégral (art. L.216-2 du Code de la consommation).
            </p>
          </section>

          {/* Article 7 : Droit de Rétractation et Exception d'Hygiène (Crucial Bougies & Parfums) */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-[#A16207]">
              <RotateCcw className="w-5 h-5 stroke-[1.5]" />
              <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
                Article 7 • Droit de Rétractation et Exceptions Légales
              </h2>
            </div>
            
            <p>
              Conformément à l'article L.221-18 du Code de la consommation, le Client dispose d'un délai légal de <strong className="text-[#1C1917]">quatorze (14) jours calendaires</strong> à compter du lendemain de la réception de son colis pour exercer son droit de rétractation sans avoir à motiver sa décision.
            </p>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900 space-y-2">
              <p className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Exception légale d'hygiène et de sécurité sanitaire (Art. L.221-28 5° du Code de la consommation) :</span>
              </p>
              <p className="text-xs leading-relaxed">
                Le droit de rétractation <strong>ne peut pas être exercé</strong> pour les produits de parfumerie, diffuseurs, huiles ou soins corporels qui ont été <strong>descellés, ouverts, vaporisés ou testés</strong> par le consommateur après la livraison, pour des motifs évidents d'hygiène et de protection de la santé.
              </p>
              <p className="text-xs leading-relaxed">
                Concernant les bougies parfumées, elles doivent être retournées rigoureusement intactes, non allumées et dans leur emballage protecteur permettant leur remise en vente immédiate. Toute bougie ayant été consumée ne sera ni reprise ni remboursée.
              </p>
            </div>

            <p>
              Les frais directs de retour des marchandises demeurent intégralement à la charge du Client (art. L.221-23). Le remboursement des sommes versées intervient dans un délai maximum de 14 jours suivant la réception et la vérification des articles intacts.
            </p>
          </section>

          {/* Article 8 : Garanties légales */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
              Article 8 • Garanties Légales (Conformité & Vices Cachés)
            </h2>
            <p>
              Tous les produits fournis bénéficient de la garantie légale de conformité prévue aux articles L.217-3 et suivants du Code de la consommation et de la garantie des vices cachés prévue aux articles 1641 et suivants du Code civil.
            </p>
            <p>
              En cas de produit reçu endommagé durant le transport ou non conforme à la commande, le Client dispose de deux (2) ans pour agir et demander le remplacement ou le remboursement de la pièce défectueuse sans frais.
            </p>
          </section>

          {/* Article 9 : Médiation de la consommation (Obligation légale 2026) */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#A16207]">
              <Scale className="w-5 h-5 stroke-[1.5]" />
              <h2 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-normal">
                Article 9 • Règlement des Litiges & Médiation de la Consommation
              </h2>
            </div>
            
            <p>
              En cas de contestation ou de litige, l'Acheteur est invité à s'adresser en priorité au service client de Club Parfum par e-mail à <strong className="text-[#1C1917]">contact@clubparfum.fr</strong> afin de privilégier une solution amiable.
            </p>
            <p>
              Conformément aux articles L.612-1 et suivants du Code de la consommation, à défaut de résolution amiable dans un délai de 30 jours, le consommateur a le droit de recourir gratuitement à un médiateur de la consommation agréé par la CECMC :
            </p>
            <ul className="pl-4 border-l-2 border-[#A16207]/40 text-[#1C1917] space-y-1 text-xs">
              <li><strong>Organisme de médiation désigné :</strong> Centre de la Médiation de la Consommation de Conciliateurs de Justice (CM2C)</li>
              <li><strong>Adresse postale :</strong> 49 Rue de Ponthieu, 75008 Paris</li>
              <li><strong>Site internet pour saisine en ligne :</strong> <a href="https://cm2c.net" target="_blank" rel="noopener noreferrer" className="text-[#A16207] underline">https://cm2c.net</a></li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
