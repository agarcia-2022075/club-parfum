import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SHIPPING_METHODS } from "@/data/mock-data";
import { Truck, ShieldCheck, MapPin, PackageCheck, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function LivraisonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#1C1917]">
      <Header />

      <main className="flex-1 py-12 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A16207] font-semibold block mb-2">
            Service Expédition
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1C1917] font-normal tracking-tight">
            Livraisons & Retours en France
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-[#57534E] leading-relaxed font-light">
            Toutes nos créations sont emballées avec des matériaux protecteurs éco-responsables pour préserver l'intégrité des flacons et de la cire végétale.
          </p>
        </div>

        {/* Tableau comparatif des modes de transport */}
        <div className="space-y-6 mb-16">
          <h2 className="font-serif text-2xl text-[#1C1917]">Nos 3 formules d'expédition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SHIPPING_METHODS.map((method) => (
              <div
                key={method.id}
                className="bg-white p-7 rounded-2xl border border-[#E7E2DA] flex flex-col justify-between shadow-sm"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A16207] block mb-2">
                    {method.carrier}
                  </span>
                  <h3 className="font-serif text-xl text-[#1C1917] mb-2">{method.name}</h3>
                  <p className="text-xs text-[#57534E] leading-relaxed font-light mb-4">{method.description}</p>
                </div>
                <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between">
                  <span className="text-xs text-[#57534E] font-medium">{method.estimated_days}</span>
                  <span className="font-serif text-xl font-bold text-[#1C1917]">{method.price.toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails Mondial Relay vs Domicile */}
        <div className="bg-white p-8 rounded-2xl border border-[#E7E2DA] space-y-6 text-xs sm:text-sm text-[#57534E] leading-relaxed">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#F2EFE9] text-[#A16207] rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-base text-[#1C1917] mb-1">Comment choisir mon Point Relais ?</h3>
              <p className="font-light">
                Lors de l'étape de validation du panier, notre carte interactive s'ouvre pour vous afficher les commerces de proximité et lockers disponibles autour de votre adresse. Votre colis y est conservé pendant 8 jours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 pt-4 border-t border-[#F2EFE9]">
            <div className="p-3 bg-[#F2EFE9] text-[#A16207] rounded-xl shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-base text-[#1C1917] mb-1">Politique de retour & Rétractation</h3>
              <p className="font-light">
                Conformément à la réglementation européenne et à l'article L221-28 du Code de la consommation, les produits de parfumerie descellés ou ouverts ne peuvent faire l'objet d'un retour pour des raisons évidentes d'hygiène et de sécurité. Les articles intacts et scellés disposent de 14 jours de délai de rétractation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
