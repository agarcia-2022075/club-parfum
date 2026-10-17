import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Building2, Server, Scale, ShieldAlert, Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Mentions Légales | Club Parfum",
  description: "Mentions légales obligatoires conformes au droit français et à la LCEN pour Club Parfum.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="mb-8 flex items-center gap-2 text-xs text-[#57534E]">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-[#1C1917] font-medium">Mentions Légales</span>
        </nav>

        <header className="mb-12 border-b border-[#E7E2DA] pb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Transparence & Réglementation
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Mentions Légales
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), il est précisé aux utilisateurs du site Club Parfum l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </p>
        </header>

        <div className="space-y-10 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
          
          {/* Article 1 : Éditeur du site */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Building2 className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">1. Éditeur de la Boutique en Ligne</h2>
            </div>
            
            <p>
              Le site internet <strong className="text-[#1C1917]">Club Parfum</strong> est édité et exploité par :
            </p>
            
            <ul className="space-y-2 pl-4 border-l-2 border-[#A16207]/40 text-[#1C1917]">
              <li><strong className="font-medium">Statut :</strong> Entrepreneur Individuel (EI) sous le régime de la Micro-entreprise</li>
              <li><strong className="font-medium">Nom commercial :</strong> Club Parfum</li>
              <li><strong className="font-medium">Exploitant / Responsable légal :</strong> [Nom et Prénom de la titulaire] EI</li>
              <li><strong className="font-medium">Adresse du siège social / domicile :</strong> [Adresse complète en France]</li>
              <li><strong className="font-medium">Numéro SIRET / SIREN :</strong> [En cours d'attribution / Numéro à 14 chiffres]</li>
              <li><strong className="font-medium">Immatriculation :</strong> Inscrit au Répertoire National des Entreprises (RNE) / RCS de [Ville]</li>
              <li><strong className="font-medium">TVA :</strong> <span className="text-[#A16207] font-semibold">TVA non applicable, art. 293 B du CGI</span> (franchise en base de TVA)</li>
              <li><strong className="font-medium">Directeur de la publication :</strong> [Nom et Prénom de la titulaire]</li>
            </ul>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#1C1917]">
                <Mail className="w-4 h-4 text-[#A16207]" />
                <span>contact@clubparfum.fr</span>
              </span>
              <span className="flex items-center gap-1.5 text-[#1C1917]">
                <Phone className="w-4 h-4 text-[#A16207]" />
                <span>06 XX XX XX XX</span>
              </span>
            </div>
          </section>

          {/* Article 2 : Hébergeur */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Server className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">2. Hébergement du Site Web</h2>
            </div>

            <p>Le site est hébergé par une infrastructure d'hébergement cloud haute disponibilité :</p>

            <ul className="space-y-1.5 pl-4 border-l-2 border-[#A16207]/40 text-[#1C1917]">
              <li><strong className="font-medium">Hébergeur principal :</strong> Vercel Inc.</li>
              <li><strong className="font-medium">Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
              <li><strong className="font-medium">Site internet :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#A16207] underline">https://vercel.com</a></li>
              <li><strong className="font-medium">Base de données & Stockage :</strong> Supabase Inc., 970 Toa Payoh North #07-04, Singapour (Serveurs régionaux hébergés dans l'Union Européenne - Francfort/Paris)</li>
            </ul>
          </section>

          {/* Article 3 : Propriété intellectuelle */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <Scale className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">3. Propriété Intellectuelle</h2>
            </div>

            <p>
              L'ensemble des éléments graphiques, photographies, descriptions olfactives, textes, logos, icônes, et arborescence figurant sur le site Club Parfum sont la propriété exclusive de l'Éditeur ou font l'objet d'une autorisation préalable d'utilisation.
            </p>
            <p>
              Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de Club Parfum, conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          {/* Article 4 : Données personnelles et contact */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E2DA] space-y-4 shadow-xs">
            <div className="flex items-center gap-3 text-[#1C1917]">
              <div className="p-2.5 rounded-lg bg-[#F2EFE9] text-[#A16207]">
                <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl font-normal">4. Protection des Données (RGPD)</h2>
            </div>

            <p>
              Les données nominatives recueillies lors des commandes (nom, prénom, adresse postale en France, e-mail, téléphone) sont indispensables au traitement logistique, à l'expédition des colis par Mondial Relay ou Colissimo, et à l'établissement des factures d'achat.
            </p>
            <p>
              Pour toute question relative au traitement de vos données ou pour exercer vos droits d'accès, de rectification et de suppression, vous pouvez vous référer à notre{" "}
              <Link href="/politique-confidentialite" className="text-[#A16207] underline font-medium">
                Politique de Confidentialité
              </Link>{" "}
              ou nous contacter par courriel à <strong className="text-[#1C1917]">contact@clubparfum.fr</strong>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
