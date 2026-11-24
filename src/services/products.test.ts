import { beforeEach, describe, expect, test } from "vitest";
import type { Db } from "@/db";
import { ServiceError } from "@/lib/http";
import { createTestDb } from "@/test/db";
import { getFilterOptions, getProduct, searchProducts } from "./products";

let db: Db;
const search = (query: Record<string, string>) => searchProducts(db, new URLSearchParams(query));

beforeEach(async () => {
  db = await createTestDb();
});

describe("Módulos 3 y 6 - Búsqueda avanzada y búsqueda por nombre", () => {
  test("UT-BUS-01: el filtro por talla usa el parámetro 'talla'", async () => {
    const results = await search({ talla: "L" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.size === "L")).toBe(true);
  });

  test("UT-BUS-02: al combinar color y rango de precio se aplican ambos filtros", async () => {
    const results = await search({ color: "Azul", precioMin: "40000", precioMax: "100000" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.color === "Azul" && p.priceCents >= 4_000_000 && p.priceCents <= 10_000_000)).toBe(true);
    expect(results.length).toBeLessThan((await search({ color: "Azul" })).length);
  });

  test("UT-BUS-03: marca y categoría se combinan, y las opciones de filtro no se repiten", async () => {
    const results = await search({ marca: "Poli Fit", categoria: "Camisetas" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.brand === "Poli Fit" && p.category === "Camisetas")).toBe(true);
    const options = await getFilterOptions(db);
    expect(Object.keys(options)).toEqual(["marca", "talla", "color", "categoria"]);
    expect(new Set(options.talla).size).toBe(options.talla.length);
  });

  test.each(["-5", "abc", "Infinity"])("UT-BUS-04: el precio «%s» se rechaza con 400", async (value) => {
    await expect(search({ precioMin: value })).rejects.toMatchObject({ status: 400 });
  });

  test("UT-BBA-01: la búsqueda por nombre ignora mayúsculas y espacios", async () => {
    const results = await search({ q: "  gorra " });
    expect(results.map((p) => p.code).sort()).toEqual(["GOR-001", "GOR-002", "GOR-003"]);
  });

  test("UT-ART-01: el detalle devuelve el artículo o 404 si no existe", async () => {
    const [first] = await search({});
    await expect(getProduct(db, first.id)).resolves.toMatchObject({ code: first.code });
    await expect(getProduct(db, 9999)).rejects.toBeInstanceOf(ServiceError);
    await expect(getProduct(db, Number.NaN)).rejects.toMatchObject({ status: 404 });
  });
});
