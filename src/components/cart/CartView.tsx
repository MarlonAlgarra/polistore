"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, formatPrice } from "@/lib/api";
import { QuantityInput } from "@/components/products/QuantityInput";
import { useCart } from "./CartProvider";

// Carrito: cantidades editables, total actualizado y confirmación del pedido (exige sesión).
export function CartView() {
  const router = useRouter();
  const { cart, update, remove, refresh } = useCart();
  const [message, setMessage] = useState({ text: "", isError: false });

  async function checkout() {
    const result = await api<{ order: { id: number } }>("/cart/checkout", { method: "POST" });
    if (!result.ok && result.status === 401) return router.push("/login?next=/carrito");
    if (result.ok) await refresh();
    setMessage(result.ok ? { text: `¡Gracias! Tu pedido #${result.data.order.id} fue confirmado.`, isError: false }
      : { text: result.error, isError: true });
  }

  if (cart.items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p role="status" className="mb-4 text-lg">{message.text || "Tu carrito está vacío."}</p>
        <Link href="/" className="btn-primary">Ver catálogo</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="card divide-y divide-primary/10">
        {cart.items.map((line) => (
          <li key={line.id} className="flex flex-wrap items-center gap-4 p-4">
            <Image src={line.imageUrl} alt="" width={72} height={72} className="rounded-lg bg-sky-50" />
            <div className="min-w-40 flex-1">
              <Link href={`/productos/${line.id}`} className="font-semibold hover:underline">{line.name}</Link>
              <p className="text-sm text-primary/70">{formatPrice(line.priceCents)} c/u</p>
            </div>
            <QuantityInput key={line.quantity} value={line.quantity} max={line.stock} label={`Cantidad de ${line.name}`}
              className="input w-20" onCommit={async (quantity) => {
                const error = await update(line.id, quantity);
                setMessage({ text: error, isError: Boolean(error) });
              }} />
            <strong className="w-28 text-right">{formatPrice(line.subtotalCents)}</strong>
            <button type="button" onClick={() => remove(line.id)} className="link text-sm">Quitar</button>
          </li>
        ))}
      </ul>
      <aside className="card h-fit space-y-4 p-6">
        <p className="flex justify-between"><span>Artículos</span><strong>{cart.count}</strong></p>
        <p className="flex justify-between text-xl"><span>Total</span><strong>{formatPrice(cart.totalCents)}</strong></p>
        <button type="button" onClick={checkout} className="btn-primary w-full">Confirmar pedido</button>
        <p role="status" className={`text-sm font-semibold ${message.isError ? "text-red-700" : "text-emerald-700"}`}>{message.text}</p>
      </aside>
    </div>
  );
}
