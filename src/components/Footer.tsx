import Link from "next/link";
import { ShieldCheck, Truck, Sparkles, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2A2421] text-[#F2EBE3] pt-16 pb-12 mt-20 border-t border-[#E8DFD8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compromisos / Reassurance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-[#70655E]/40 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="p-3 bg-[#FAF8F5]/10 rounded-full text-[#E8DCC4]">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="font-medium text-sm tracking-wide">Livraison en France</h4>
            <p className="text-xs text-[#E8DCC4]/80 leading-relaxed">
              En Point Relais (Mondial Relay) ou à domicile (Colissimo) avec suivi.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="p-3 bg-[#FAF8F5]/10 rounded-full text-[#E8DCC4]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-medium text-sm tracking-wide">Qualité & Senteurs Raffinées</h4>
            <p className="text-xs text-[#E8DCC4]/80 leading-relaxed">
              Formules sélectionnées avec soin, cires végétales et fragrances intenses.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="p-3 bg-[#FAF8F5]/10 rounded-full text-[#E8DCC4]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-medium text-sm tracking-wide">Paiement 100% Sécurisé</h4>
            <p className="text-xs text-[#E8DCC4]/80 leading-relaxed">
              Cartes Bancaires (CB), Apple Pay et PayPal avec chiffrement SSL.
            </p>
          </div>
        </div>

        {/* Enlaces y menciones legales obligatorias en Francia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 text-xs text-[#E8DCC4]/80">
          <div className="space-y-3">
            <span className="font-serif text-lg tracking-[0.2em] font-light text-white uppercase block">
              Club Parfum
            </span>
            <p className="leading-relaxed">
              Sublimez vos espaces de vie avec des fragrances chaleureuses et authentiques.
            </p>
          </div>

          <div>
            <h5 className="font-medium text-white tracking-wider uppercase mb-3">Informations</h5>
            <ul className="space-y-2">
              <li><Link href="#collections" className="hover:text-white transition">Nos Collections</Link></li>
              <li><Link href="#livraison" className="hover:text-white transition">Frais & Délais de livraison</Link></li>
              <li><Link href="#contact" className="hover:text-white transition">Nous contacter</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-white tracking-wider uppercase mb-3">Cadre Légal</h5>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className="hover:text-white transition">Mentions Légales</Link></li>
              <li><Link href="/cgv" className="hover:text-white transition">Conditions Générales de Vente (CGV)</Link></li>
              <li><Link href="/politique-retractation" className="hover:text-white transition">Droit de Rétractation (14j)</Link></li>
              <li><Link href="/politique-confidentialite" className="hover:text-white transition">Protection des Données (RGPD)</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-white tracking-wider uppercase mb-3">Fiscalité & Statut</h5>
            <p className="leading-relaxed text-[11px] text-[#E8DCC4]/70">
              Micro-entreprise enregistrée en France.<br />
              <strong className="text-white">TVA non applicable, art. 293 B du CGI.</strong>
            </p>
          </div>
        </div>

        {/* Créditos */}
        <div className="pt-8 border-t border-[#70655E]/40 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#E8DCC4]/60 gap-4">
          <p>© 2026 Club Parfum. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Créé avec soin pour des moments chaleureux.
          </p>
        </div>
      </div>
    </footer>
  );
}
