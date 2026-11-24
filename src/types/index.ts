import type { products } from "@/db/schema";

// Tipos compartidos entre la interfaz y las rutas de API.
export type Product = typeof products.$inferSelect;

export type User = { id: number; name: string; email: string };

export type CartLine = Pick<Product, "id" | "name" | "priceCents" | "stock" | "imageUrl"> & {
  quantity: number;
  subtotalCents: number;
};

export type Cart = { items: CartLine[]; count: number; totalCents: number };
