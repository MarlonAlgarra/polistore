"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, formatPrice } from "@/lib/api";
import type { Product } from "@/types";
import { BuyPanel } from "./BuyPanel";
import { ImageModal } from "./ImageModal";
import { Availability } from "./ProductCard";

// Detalle del artículo con sus características y el panel de compra.
export function ProductDetail({ id }: { id: string }) {
  const [state, setState] = useState<{ product?: Product; error?: string }>({});
  const [version, setVersion] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { product, error } = state;

  useEffect(() => {
    let active = true;
    api<{ product: Product }>(`/products/${encodeURIComponent(id)}`).then((result) => {
      if (active) setState(result.ok ? { product: result.data.product } : { error: result.error });
    });
    return () => {
      active = false;
    };
  }, [id, version]);

  if (error) return <p role="alert" className="card p-6">{error} <Link href="/" className="link">Volver al catálogo</Link></p>;
  if (!product) return <p aria-busy="true" className="py-12 text-center">Cargando artículo…</p>;
  const features = [["Código", product.code], ["Marca", product.brand], ["Categoría", product.category],
    ["Talla", product.size], ["Color", product.color], ["Existencias", String(product.stock)]];
  return (
    <article className="grid gap-8 md:grid-cols-2">
      <button type="button" onClick={() => setIsOpen(true)} aria-label="Ampliar la descripción" className="card bg-sky-50 p-6">
        <Image src={product.imageUrl} alt={product.name} width={520} height={520} priority className="mx-auto w-full max-w-md" />
      </button>
      <div className="space-y-5">
        <Link href="/" className="link text-sm">← Volver al catálogo</Link>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="flex items-center gap-3">
          <strong className="text-2xl">{formatPrice(product.priceCents)}</strong>
          <Availability stock={product.stock} />
        </div>
        <p className="text-primary/80">{product.description}</p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-sky-50 p-4 text-sm">
          {features.map(([label, value]) => (
            <div key={label}><dt className="text-primary/60">{label}</dt><dd className="font-semibold">{value}</dd></div>
          ))}
        </dl>
        <BuyPanel product={product} onPurchased={() => setVersion((v) => v + 1)} />
      </div>
      {isOpen && <ImageModal product={product} onClose={() => setIsOpen(false)} />}
    </article>
  );
}
