import Link from "next/link";
import { ShieldCheck, Truck, Sparkles, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <>
      {/* ========================================================= */}
      {/* FRANJA 1 : BANDE DE REASSURANCE CROMÁTICA CÁLIDA (#EDE8DF) */}
      {/* ========================================================= */}
      <aside
        aria-label="Engagements et Garanties de la Maison"
        className="bg-[#EDE8DF] text-[#1C1917] border-t border-b border-[#DCD5C9] py-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Engagements et Garanties de la Maison</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            {/* 1. Livraison Offerte */}
            <div className="flex flex-col items-center md:items-start space-y-2.5">
              <div className="p-3.5 bg-white rounded-full text-[#A16207] border border-[#DCD5C9] shadow-2xs">
                <Truck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-medium leading-snug">
                Livraison Offerte dès 60 €
              </h3>
              <p className="text-sm sm:text-[15px] text-[#44403C] leading-relaxed max-w-sm font-light">
                En Point Relais (Mondial Relay dès 4,50 €) ou à domicile (Colissimo dès 6,90 €). Frais entièrement offerts à partir de 60 € d&apos;achat.
              </p>
            </div>

            {/* 2. Concentrés Purs de Grasse */}
            <div className="flex flex-col items-center md:items-start space-y-2.5">
              <div className="p-3.5 bg-white rounded-full text-[#A16207] border border-[#DCD5C9] shadow-2xs">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-medium leading-snug">
                Concentrés Purs de Grasse
              </h3>
              <p className="text-sm sm:text-[15px] text-[#44403C] leading-relaxed max-w-sm font-light">
                Eaux de parfum de haute tenue (15% à 20% d&apos;extraits purs) et bougies 100% cire végétale de soja & colza sans paraffine.
              </p>
            </div>

            {/* 3. Paiement Sécurisé & Retours */}
            <div className="flex flex-col items-center md:items-start space-y-2.5">
              <div className="p-3.5 bg-white rounded-full text-[#A16207] border border-[#DCD5C9] shadow-2xs">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] font-medium leading-snug">
                Commandes Sécurisées &amp; Retours
              </h3>
              <p className="text-sm sm:text-[15px] text-[#44403C] leading-relaxed max-w-sm font-light">
                Transactions chiffrées SSL 256-bit et protection des données. Droit de rétractation de 14 jours pour tout flacon scellé.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* FRANJA 2 : CORPS PRINCIPAL DU PIED DE PAGE NOIR (#1C1917)  */}
      {/* ========================================================= */}
      <footer className="bg-[#1C1917] text-[#E7E2DA] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="sr-only">Navigation et Informations de la Maison</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 text-sm sm:text-[15px] text-[#D6D3D1]">
            {/* Colonne 1 : Identité */}
            <div className="space-y-3">
              <span className="font-serif text-2xl tracking-[0.22em] font-normal text-[#FAFAF8] uppercase block leading-snug">
                Club Parfum
              </span>
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-[#D4A359] font-semibold block -mt-2">
                Maison de Senteurs • Grasse
              </span>
              <p className="leading-relaxed text-sm text-[#A8A29E] pt-2 font-light">
                Artisan parfumeur attaché à la noblesse des matières premières végétales et aux accords olfactifs intemporels de Grasse.
              </p>
              <p className="text-xs text-[#A8A29E] pt-1">
                Atelier & Service Client :{" "}
                <a
                  href="tel:+33769914251"
                  className="text-white hover:text-[#D4A359] font-medium transition-colors"
                >
                  +33 7 69 91 42 51
                </a>
              </p>
            </div>

            {/* Colonne 2 : Maison & Collections */}
            <div>
              <h3 className="text-xs sm:text-[13px] font-semibold text-white tracking-[0.18em] uppercase mb-4">
                Maison & Collections
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/boutique"
                    className="hover:text-white transition-colors"
                  >
                    La Boutique (Catalogue Complet)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/eaux-de-parfum"
                    className="hover:text-white transition-colors"
                  >
                    Eaux de Parfum (15-20%)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/bougies-parfumees"
                    className="hover:text-white transition-colors"
                  >
                    Bougies Végétales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/categories/maison"
                    className="hover:text-white transition-colors"
                  >
                    Maison & Brumes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#diagnostic-olfactif"
                    className="text-[#D4A359] hover:underline transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>Diagnostic Olfactif en 30s</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/notre-histoire"
                    className="hover:text-white transition-colors"
                  >
                    Notre Histoire / Qui sommes-nous ?
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compte"
                    className="text-[#E7E2DA] hover:text-[#D4A359] font-medium transition-colors"
                  >
                    Mon Compte & Suivi Colis
                  </Link>
                </li>
                <li>
                  <Link
                    href="/livraison"
                    className="hover:text-white transition-colors"
                  >
                    Livraisons & Retours
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="hover:text-white transition-colors"
                  >
                    Foire Aux Questions (FAQ)
                  </Link>
                </li>
                <li>
                  <a
                    href="https://wa.me/33769914251?text=Bonjour%20Club%20Parfum,%20j'aimerais%20un%20conseil%20personnalis%C3%A9%20sur%20vos%20senteurs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#D4A359] hover:underline transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Conseil WhatsApp (+33 7 69 91 42 51)</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonne 3 : Cadre Légal */}
            <div>
              <h3 className="text-xs sm:text-[13px] font-semibold text-white tracking-[0.18em] uppercase mb-4">
                Cadre Légal & Éthique
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/mentions-legales"
                    className="hover:text-white transition-colors"
                  >
                    Mentions Légales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cgv"
                    className="hover:text-white transition-colors"
                  >
                    Conditions Générales de Vente (CGV)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-retractation"
                    className="hover:text-white transition-colors"
                  >
                    Droit de Rétractation (14 jours)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-confidentialite"
                    className="hover:text-white transition-colors"
                  >
                    Protection des Données (RGPD)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Colonne 4 : Fiscalité & Statut */}
            <div>
              <h3 className="text-xs sm:text-[13px] font-semibold text-white tracking-[0.18em] uppercase mb-4">
                Fiscalité & Statut
              </h3>
              <div className="leading-relaxed text-sm text-[#A8A29E] space-y-2 font-light">
                <p>
                  Micro-entreprise enregistrée en France sous le régime des artisans parfumeurs.
                </p>
                <p className="border-t border-[#44403C]/50 pt-2 text-[#E7E2DA]">
                  <strong className="text-[#FAFAF8] font-semibold">TVA non applicable</strong>, art. 293 B du CGI.
                </p>
                <p className="text-xs text-[#A8A29E]">
                  Expéditions assurées depuis nos ateliers vers toute la France métropolitaine.
                </p>
              </div>
            </div>
          </div>

          {/* Bandeau d'Expéditions et Transporteurs */}
          <div className="py-6 border-y border-[#44403C]/60 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-[#A8A29E] font-medium">
                Garantie Atelier :
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#FAFAF8] font-medium">
                  Maison Artisanale • Expéditions soignées vers toute la France • Chiffrement SSL 256-bit
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-xs font-medium text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SSL 256-bit</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-[#A8A29E] font-medium">
                Transporteurs :
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-[#292524] border border-[#44403C] text-xs font-medium text-[#FAFAF8]">
                  Mondial Relay
                </span>
                <span className="px-3 py-1 rounded-md bg-[#292524] border border-[#44403C] text-xs font-medium text-[#FAFAF8]">
                  La Poste Colissimo
                </span>
              </div>
            </div>
          </div>

          {/* Crédits */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-[#A8A29E] gap-4">
            <p>© 2026 Club Parfum • Maison de Senteurs. Tous droits réservés.</p>

            <div className="flex items-center gap-6">
              <p className="text-[#E7E2DA]">
                Haute Parfumerie &amp; Bougies Végétales de Grasse.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
