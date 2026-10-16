import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types/store";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#E7E2DA] transition-all duration-300 hover:shadow-xl hover:border-[#A16207]/40 relative">
      {/* Lien vers la fiche produit dédiée */}
      <Link href={`/produits/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#F2EFE9]">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          unoptimized
        />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 text-[10px] font-semibold tracking-[0.2em] uppercase bg-[#FAFAF8]/95 backdrop-blur-sm text-[#1C1917] rounded-sm shadow-xs border border-[#E7E2DA]">
            {product.category_name}
          </span>
        </div>
      </Link>

      {/* Détails du produit */}
      <div className="p-6 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Notes olfactives */}
          <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Notes olfactives">
            {product.scent_notes.map((note, idx) => (
              <span
                key={idx}
                className="text-[11px] text-[#57534E] bg-[#FAFAF8] border border-[#E7E2DA] px-2.5 py-0.5 rounded-sm font-normal tracking-wide"
              >
                {note}
              </span>
            ))}
          </div>

          {/* Titre avec lien */}
          <Link href={`/produits/${product.slug}`}>
            <h3 className="font-serif text-2xl font-normal text-[#1C1917] leading-tight group-hover:text-[#A16207] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Description courte */}
          <p className="mt-2 text-xs text-[#57534E] line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Prix et Découvrir */}
        <div className="mt-6 pt-4 border-t border-[#F2EFE9] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#57534E] block">À partir de</span>
            <span className="font-serif text-2xl font-medium text-[#1C1917]">
              {formatPrice(product.base_price)}
            </span>
          </div>

          <Link
            href={`/produits/${product.slug}`}
            className="min-h-[40px] px-4 py-2 rounded-md bg-[#1C1917] hover:bg-[#A16207] text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <span>Découvrir</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
