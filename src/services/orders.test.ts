import { beforeEach, describe, expect, test } from "vitest";
import type { Db } from "@/db";
import { orders } from "@/db/schema";
import { createTestDb, productByCode } from "@/test/db";
import { registerUser } from "./auth";
import { placeOrder } from "./orders";

let db: Db;
let userId: number;

beforeEach(async () => {
  db = await createTestDb();
  ({ id: userId } = await registerUser(db, { name: "Ana", email: "ana@poli.edu.co", password: "segura123" }));
});

describe("Módulo 4 - Compra por artículo", () => {
  test("UT-REG-04: sin sesión no se llega al pedido y no se descuentan existencias", async () => {
    const product = await productByCode(db, "CAM-001");
    await expect(placeOrder(db, null, [{ productId: product.id, quantity: 1 }])).rejects.toMatchObject({ status: 401 });
    expect((await productByCode(db, "CAM-001")).stock).toBe(product.stock);
    expect(await db.select().from(orders)).toHaveLength(0);
  });

  test.each([0, -1, 1.5, "2", true, null])("UT-COM-01: la cantidad mínima es 1 (rechaza %s)", async (quantity) => {
    const product = await productByCode(db, "CAM-001");
    await expect(placeOrder(db, userId, [{ productId: product.id, quantity }])).rejects.toMatchObject({ status: 400 });
  });

  test("UT-COM-02: la cantidad no puede superar las existencias", async () => {
    const product = await productByCode(db, "CHA-003");
    await expect(placeOrder(db, userId, [{ productId: product.id, quantity: product.stock + 1 }])).rejects.toMatchObject({ status: 409 });
    const agotado = await productByCode(db, "GOR-003");
    await expect(placeOrder(db, userId, [{ productId: agotado.id, quantity: 1 }])).rejects.toMatchObject({ status: 409 });
  });

  test("UT-COM-03: una compra válida descuenta existencias y calcula el total con el precio de la BD", async () => {
    const product = await productByCode(db, "CHA-003");
    const order = await placeOrder(db, userId, [{ productId: product.id, quantity: product.stock }]);
    expect(order.totalCents).toBe(product.stock * product.priceCents);
    expect((await productByCode(db, "CHA-003")).stock).toBe(0);
  });

  test("UT-COM-04: artículo inexistente o id inválido (404) y pedido fallido sin cambios en existencias", async () => {
    await expect(placeOrder(db, userId, [{ productId: 9999, quantity: 1 }])).rejects.toMatchObject({ status: 404 });
    await expect(placeOrder(db, userId, [{ productId: Number.NaN, quantity: 1 }])).rejects.toMatchObject({ status: 404 });
    const termo = await productByCode(db, "ACC-001");
    const balon = await productByCode(db, "ACC-005");
    const lines = [{ productId: termo.id, quantity: 2 }, { productId: balon.id, quantity: balon.stock + 1 }];
    await expect(placeOrder(db, userId, lines)).rejects.toMatchObject({ status: 409 });
    expect((await productByCode(db, "ACC-001")).stock).toBe(termo.stock);
  });
});
