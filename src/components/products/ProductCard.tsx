"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/types";
import { ImageModal } from "./ImageModal";

export function Availability({ stock }: { stock: number }) {
  if (stock < 1) return <span className="badge bg-red-100 text-red-800">Agotado</span>;
  return <span className="badge bg-emerald-100 text-emerald-800">{stock < 10 ? `¡Últimas ${stock}!` : `${stock} disponibles`}</span>;
}

// Tarjeta del catálogo: imagen (clic = descripción ampliada), nombre, precio y disponibilidad.
export function ProductCard({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
      <button type="button" onClick={() => setIsOpen(true)} className="relative aspect-square bg-sky-50"
        aria-label={`Ver descripción ampliada de ${product.name}`}>
        <Image src={product.imageUrl} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-contain p-4 transition group-hover:scale-105" />
        <span className="absolute left-3 top-3 badge bg-primary text-white">{product.category}</span>
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{product.brand}</p>
        <h3 className="font-bold leading-snug">
          <Link href={`/productos/${product.id}`} className="hover:underline">{product.name}</Link>
        </h3>
        <p className="text-sm text-primary/70">Talla {product.size} · {product.color}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <strong className="text-lg">{formatPrice(product.priceCents)}</strong>
          <Availability stock={product.stock} />
        </div>
      </div>
      {isOpen && <ImageModal product={product} onClose={() => setIsOpen(false)} />}
    </article>
  );
}
