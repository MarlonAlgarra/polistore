"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, postJson, type ApiResult } from "@/lib/api";
import type { Cart } from "@/types";

const EMPTY: Cart = { items: [], count: 0, totalCents: 0 };

type CartContextValue = {
  cart: Cart;
  add: (productId: number, quantity: number) => Promise<string>;
  update: (productId: number, quantity: number) => Promise<string>;
  remove: (productId: number) => Promise<string>;
  refresh: () => Promise<string>;
};

const CartContext = createContext<CartContextValue | null>(null);

// El carrito vive en el servidor (cookie httpOnly); aquí solo se refleja su estado.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY);
  const lastRequest = useRef(0);
  // Solo se aplica la respuesta de la petición más reciente (evita que una respuesta vieja pise a una nueva).
  const send = useCallback(async (path: string, init: RequestInit | undefined, okMessage: string) => {
    const request = ++lastRequest.current;
    const result: ApiResult<Cart> = await api<Cart>(path, init);
    if (result.ok && request === lastRequest.current) setCart(result.data);
    return result.ok ? okMessage : result.error;
  }, []);

  useEffect(() => {
    api<Cart>("/cart").then((result) => result.ok && lastRequest.current === 0 && setCart(result.data));
  }, []);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    add: (id, quantity) => send(`/cart/${id}`, postJson({ quantity }), "Agregado al carrito."),
    update: (id, quantity) => send(`/cart/${id}`, postJson({ quantity }, "PUT"), ""),
    remove: (id) => send(`/cart/${id}`, { method: "DELETE" }, ""),
    refresh: () => send("/cart", undefined, ""),
  }), [cart, send]);
  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
