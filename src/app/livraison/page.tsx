import { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SHIPPING_METHODS } from "@/data/mock-data";
import { Truck, ShieldCheck, MapPin, PackageCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Livraisons & Retours | Mondial Relay, Colissimo & Livraison Offerte dès 60 €",
  description:
    "Consultez les modes d'expédition de Club Parfum en France : Point Relais Mondial Relay (4,50 €), Colissimo Domicile (6,90 €), Express Chronopost et livraison 100% offerte dès 60 € d'achat.",
  openGraph: {
    title: "Livraisons & Retours en France • Club Parfum",
    description: "Expéditions soignées sous 24h/48h. Frais de port offerts dès 60 € d'achat.",
  },
};

export default function LivraisonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[#A16207] font-semibold block mb-2">
            Service Expédition France
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Livraisons & Retours en France
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#57534E] leading-relaxed font-normal">
            Toutes nos créations sont emballées avec des matériaux protecteurs éco-responsables pour préserver l&apos;intégrité des flacons de Grasse et de la cire végétale pure.
          </p>
        </div>

        {/* Bannière de mise en avant du seuil de 60 € */}
        <div className="mb-12 p-6 rounded-2xl bg-[#F2EFE9] border border-[#E7E2DA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#A16207] shadow-xs shrink-0">
              <Sparkles className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-[#1C1917]">Livraison Standard Offerte dès 60 €</h3>
              <p className="text-sm text-[#44403C] font-normal mt-0.5">
                Valable automatiquement sur Point Relais (Mondial Relay) et Colissimo Domicile pour toute commande dès 60,00 €.
              </p>
            </div>
          </div>
          <Link
            href="/boutique"
            className="px-6 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-sm font-medium tracking-[0.12em] uppercase transition shrink-0 shadow-xs cursor-pointer"
          >
            Découvrir la boutique
          </Link>
        </div>

        {/* Tableau comparatif des modes de transport */}
        <div className="space-y-6 mb-16">
          <h2 className="font-serif text-2xl text-[#1C1917]">Nos 3 formules d&apos;expédition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHIPPING_METHODS.map((method) => (
              <div
                key={method.id}
                className="bg-white p-7 rounded-2xl border border-[#E7E2DA] flex flex-col justify-between shadow-xs hover:border-[#A16207]/40 transition"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A16207] block mb-2">
                    {method.carrier}
                  </span>
                  <h3 className="font-serif text-xl text-[#1C1917] mb-2">{method.name}</h3>
                  <p className="text-sm text-[#44403C] leading-relaxed font-normal mb-4">{method.description}</p>
                </div>
                <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between">
                  <span className="text-sm text-[#57534E] font-medium">{method.estimated_days}</span>
                  <span className="font-serif text-xl font-bold text-[#1C1917]">{method.price.toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails Mondial Relay vs Domicile */}
        <div className="bg-white p-8 rounded-2xl border border-[#E7E2DA] space-y-6 text-sm sm:text-base text-[#44403C] leading-relaxed">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#F2EFE9] text-[#A16207] rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-[#1C1917] mb-1">Comment choisir mon Point Relais ?</h3>
              <p className="font-normal text-[#44403C]">
                Lors de l&apos;étape de validation du panier, notre sélecteur vous permet de désigner le commerce de proximité ou locker le plus pratique autour de votre adresse. Votre colis y est conservé pendant 8 jours ouvrés.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 border-t border-[#F2EFE9]">
            <div className="p-3 bg-[#F2EFE9] text-[#A16207] rounded-xl shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-lg text-[#1C1917] mb-1">Politique de retour & Rétractation (14 jours)</h3>
              <p className="font-normal text-[#44403C]">
                Conformément à l&apos;article L.221-28 du Code de la consommation, les produits cosmétiques et de parfumerie descellés ne peuvent faire l&apos;objet d&apos;un retour pour des motifs de protection sanitaire et d&apos;hygiène. Les flacons et bougies encore scellés dans leur emballage intact bénéficient de 14 jours de rétractation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
