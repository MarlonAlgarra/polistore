import { and, eq, gte, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { ServiceError } from "@/lib/http";

export type OrderLine = { productId: number; quantity: unknown };
export type OrderSummary = { id: number; totalCents: number };

// La cantidad es un entero desde 1 hasta las existencias disponibles.
export function validateQuantity(quantity: unknown, stock: number): number {
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    throw new ServiceError("La cantidad mínima es 1 unidad.");
  }
  if (quantity > stock) throw new ServiceError(`Solo hay ${stock} unidades disponibles.`, 409);
  return quantity;
}

// Crea el pedido de un cliente con sesión y descuenta existencias en una sola transacción.
export async function placeOrder(db: Db, userId: number | null, lines: OrderLine[]): Promise<OrderSummary> {
  if (userId === null) throw new ServiceError("Inicia sesión para continuar con tu pedido.", 401);
  if (lines.length === 0) throw new ServiceError("El pedido no tiene artículos.");
  return db.transaction(async (tx) => {
    const items = [];
    for (const line of lines) {
      const [product] = Number.isInteger(line.productId)
        ? await tx.select().from(products).where(eq(products.id, line.productId)) : [];
      if (!product) throw new ServiceError("Uno de los artículos no existe.", 404);
      const quantity = validateQuantity(line.quantity, product.stock);
      const updated = await tx.update(products).set({ stock: sql`${products.stock} - ${quantity}` })
        .where(and(eq(products.id, product.id), gte(products.stock, quantity))).returning({ id: products.id });
      if (updated.length === 0) throw new ServiceError("Las existencias cambiaron; vuelve a intentarlo.", 409);
      items.push({ productId: product.id, quantity, unitPriceCents: product.priceCents });
    }
    const totalCents = items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0);
    const [order] = await tx.insert(orders).values({ userId, totalCents }).returning({ id: orders.id });
    await tx.insert(orderItems).values(items.map((item) => ({ ...item, orderId: order.id })));
    return { id: order.id, totalCents };
  });
}
