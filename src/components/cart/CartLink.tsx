"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { cart } = useCart();
  return (
    <Link href="/carrito" className="btn-ghost relative" aria-label={`Carrito, ${cart.count} artículos`}>
      <span aria-hidden="true">🛒</span> Carrito
      <span className="ml-1 rounded-full bg-secondary px-2 text-xs font-bold text-primary">{cart.count}</span>
    </Link>
  );
}
