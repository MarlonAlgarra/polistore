import { describe, expect, test } from "vitest";
import { buildQuery, readFilters } from "./filters";

describe("Búsqueda avanzada (cliente)", () => {
  test("UT-BUS-01 (cliente): el filtro de talla se envía con el parámetro 'talla'", () => {
    expect(buildQuery({ talla: "M" })).toBe("?talla=M");
    expect(readFilters(new URLSearchParams("talla=L"))).toEqual({ talla: "L" });
  });

  test("UT-BUS-02 (cliente): color y rango de precio viajan juntos en la misma consulta", () => {
    const query = new URLSearchParams(buildQuery({ color: "Azul", precioMin: "40000", precioMax: "100000" }));
    expect(query.get("color")).toBe("Azul");
    expect(query.get("precioMin")).toBe("40000");
    expect(query.get("precioMax")).toBe("100000");
  });

  test("omite filtros vacíos y recorta espacios", () => {
    expect(buildQuery({ q: "  gorra ", marca: "", talla: "   " })).toBe("?q=gorra");
    expect(buildQuery({})).toBe("");
  });
});
