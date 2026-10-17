"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalCount } = useCart();

  // Bloquer le scroll de la page lorsque le panier est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Fond sombre cliquable pour fermer */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-white border-l border-[#E7E2DA] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* En-tête du Panier */}
          <div className="p-6 border-b border-[#F2EFE9] flex items-center justify-between bg-[#FAFAF8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#A16207]" />
              <h2 className="font-serif text-2xl font-normal text-[#1C1917]">
                Votre Panier
              </h2>
              <span className="text-xs bg-[#F2EFE9] text-[#57534E] px-2 py-0.5 rounded-full font-medium">
                {totalCount}
              </span>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-[#57534E] hover:text-[#1C1917] rounded-full hover:bg-[#F2EFE9] transition cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des articles */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F2EFE9] flex items-center justify-center mx-auto text-[#A16207]">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <h3 className="font-serif text-2xl text-[#1C1917]">Votre panier est vide</h3>
                <p className="text-xs text-[#57534E] max-w-xs mx-auto leading-relaxed font-light">
                  Laissez-vous tenter par nos bougies végétales ou nos eaux de parfum pour embaumer votre quotidien.
                </p>
                <div className="pt-2">
                  <Link
                    href="/boutique"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C1917] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A16207] transition"
                  >
                    <span>Découvrir la boutique</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-[#F2EFE9]">
                {items.map((item) => (
                  <li key={item.id} className="py-4 flex gap-4">
                    {/* Miniature du produit */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F2EFE9] shrink-0 border border-[#E7E2DA]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* Informations et contrôles */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link
                            href={`/produits/${item.slug}`}
                            onClick={closeCart}
                            className="font-serif text-base font-medium text-[#1C1917] hover:text-[#A16207] transition line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[11px] text-[#A16207] font-medium block mt-0.5">
                            {item.variantLabel}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#57534E] hover:text-red-600 p-1 transition cursor-pointer"
                          aria-label={`Supprimer ${item.name} du panier`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Sélecteur de quantité */}
                        <div className="flex items-center border border-[#E7E2DA] rounded-lg bg-white px-2 py-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                            aria-label="Diminuer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-[#1C1917]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs font-bold text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                            aria-label="Augmenter"
                          >
                            +
                          </button>
                        </div>

                        {/* Prix de la ligne */}
                        <span className="font-serif text-base font-semibold text-[#1C1917]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pied du Panier (Sous-total & Validation) */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E7E2DA] bg-[#FAFAF8] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#57534E]">
                  <span>Sous-total</span>
                  <span className="font-serif text-base font-semibold text-[#1C1917]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#57534E]">
                  <span>Frais de livraison</span>
                  <span>Calculés à l'étape suivante (dès 4,50 €)</span>
                </div>
              </div>

              {/* Bouton Commander */}
              <Link
                href="/commander"
                onClick={closeCart}
                className="w-full min-h-[50px] py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Valider la commande</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Rassurance sous le bouton */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-[#57534E]">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A16207]" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#A16207]" />
                  <span>Point Relais & Colissimo</span>
                </div>
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}
