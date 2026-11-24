import { beforeEach, describe, expect, test } from "vitest";
import type { Db } from "@/db";
import { createTestDb, productByCode } from "@/test/db";
import { registerUser } from "./auth";
import { parseCart, removeItem, setQuantity, summarize } from "./cart";
import { placeOrder } from "./orders";

let db: Db;

beforeEach(async () => {
  db = await createTestDb();
});

describe("Módulo 7 - Carrito", () => {
  test("UT-CAR-01: agregar acumula, cambiar fija la cantidad, quitar elimina y el total se actualiza", async () => {
    const gorra = await productByCode(db, "GOR-001");
    const termo = await productByCode(db, "ACC-001");
    let cart = await setQuantity(db, {}, gorra.id, 1, true);
    cart = await setQuantity(db, cart, gorra.id, 2, true);
    cart = await setQuantity(db, cart, termo.id, 2, false);
    const summary = await summarize(db, cart);
    expect(summary.count).toBe(5);
    expect(summary.totalCents).toBe(3 * gorra.priceCents + 2 * termo.priceCents);
    expect((await summarize(db, removeItem(cart, gorra.id))).count).toBe(2);
  });

  test("UT-CAR-02: cantidades fuera de rango no cambian el carrito", async () => {
    const balon = await productByCode(db, "ACC-005");
    await expect(setQuantity(db, {}, balon.id, 0, false)).rejects.toMatchObject({ status: 400 });
    await expect(setQuantity(db, {}, balon.id, balon.stock + 1, false)).rejects.toMatchObject({ status: 409 });
    const full = await setQuantity(db, {}, balon.id, balon.stock, true);
    await expect(setQuantity(db, full, balon.id, 1, true)).rejects.toMatchObject({ status: 409 });
  });

  test("UT-CAR-03: confirmar el pedido usa las líneas del carrito, exige sesión e ignora artículos inexistentes", async () => {
    const balon = await productByCode(db, "ACC-005");
    const cart = { ...(await setQuantity(db, {}, balon.id, 2, true)), 9999: 1 };
    const { items, totalCents } = await summarize(db, cart);
    const lines = items.map((item) => ({ productId: item.id, quantity: item.quantity }));
    await expect(placeOrder(db, null, lines)).rejects.toMatchObject({ status: 401 });
    const { id: userId } = await registerUser(db, { name: "Luis", email: "luis@poli.edu.co", password: "segura123" });
    await expect(placeOrder(db, userId, lines)).resolves.toMatchObject({ totalCents });
    expect((await productByCode(db, "ACC-005")).stock).toBe(balon.stock - 2);
  });

  test("UT-CAR-04: una cookie de carrito alterada se ignora", () => {
    expect(parseCart('{"3":2,"x":1,"4":-1,"5":1.5}')).toEqual({ 3: 2 });
    expect(parseCart("no-json")).toEqual({});
    expect(parseCart(undefined)).toEqual({});
  });
});
