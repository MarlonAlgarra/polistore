"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { api, formatPrice, postJson } from "@/lib/api";
import { clampQuantity, INITIAL_QUANTITY } from "@/lib/quantity";
import type { Product } from "@/types";
import { QuantityInput } from "./QuantityInput";

// Compra por artículo: selección de cantidad (1..existencias) y compra directa con sesión.
export function BuyPanel({ product, onPurchased }: { product: Product; onPurchased: () => void }) {
  const router = useRouter();
  const { add, refresh } = useCart();
  const [quantity, setQuantity] = useState(INITIAL_QUANTITY);
  const [message, setMessage] = useState("");
  const change = (value: number) => setQuantity(clampQuantity(value, product.stock));

  async function buyNow() {
    const result = await api<{ order: { id: number } }>("/orders", postJson({ productId: product.id, quantity }));
    if (!result.ok && result.status === 401) return router.push(`/login?next=/productos/${product.id}`);
    setMessage(result.ok ? `¡Listo! Pedido #${result.data.order.id} confirmado.` : result.error);
    if (!result.ok) return;
    setQuantity(INITIAL_QUANTITY);
    await Promise.all([refresh(), onPurchased()]);
  }

  if (product.stock < 1) return <p className="font-semibold text-red-700">Agotado por ahora.</p>;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span id="cantidad-label" className="font-semibold">Cantidad</span>
        <div role="group" aria-labelledby="cantidad-label" className="flex items-center rounded-xl border border-primary/20">
          <button type="button" onClick={() => change(quantity - 1)} disabled={quantity <= 1} aria-label="Quitar una" className="qty-btn">−</button>
          <QuantityInput key={quantity} value={quantity} max={product.stock} label="Cantidad" onCommit={change}
            className="w-14 bg-transparent text-center font-bold" />
          <button type="button" onClick={() => change(quantity + 1)} disabled={quantity >= product.stock} aria-label="Agregar una" className="qty-btn">+</button>
        </div>
        <span className="text-sm text-primary/70">Total {formatPrice(quantity * product.priceCents)}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={buyNow} className="btn-primary">Comprar ahora</button>
        <button type="button" onClick={async () => setMessage(await add(product.id, quantity))} className="btn-secondary">Agregar al carrito</button>
      </div>
      <p role="status" className="text-sm font-semibold">{message}</p>
    </div>
  );
}
