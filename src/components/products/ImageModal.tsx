"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPrice } from "@/lib/api";
import type { Product } from "@/types";

// Ventana con la imagen grande y la descripción ampliada del artículo (se cierra con Esc).
export function ImageModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => opener?.focus();
  }, []);
  return (
    <dialog ref={dialog} onClose={onClose} aria-labelledby={`modal-${product.id}`}
      className="m-auto w-[min(92vw,720px)] rounded-2xl p-0 backdrop:bg-primary/60">
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <Image src={product.imageUrl} alt={product.name} width={320} height={320} className="w-full rounded-xl bg-sky-50" />
        <div className="space-y-3">
          <h2 id={`modal-${product.id}`} className="text-2xl font-bold">{product.name}</h2>
          <p className="text-primary/80">{product.description}</p>
          <p className="text-xl font-bold">{formatPrice(product.priceCents)}</p>
          <div className="flex gap-2 pt-2">
            <Link href={`/productos/${product.id}`} onClick={() => dialog.current?.close()} className="btn-primary">Ver y comprar</Link>
            <button type="button" onClick={() => dialog.current?.close()} className="btn-secondary">Cerrar</button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
