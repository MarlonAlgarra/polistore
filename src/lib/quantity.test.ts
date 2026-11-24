import { describe, expect, test } from "vitest";
import { clampQuantity, INITIAL_QUANTITY } from "./quantity";

describe("Selección de cantidad (cliente)", () => {
  test("UT-COM-01 (cliente): la cantidad empieza en 1 y nunca baja de 1", () => {
    expect(INITIAL_QUANTITY).toBe(1);
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(-3, 10)).toBe(1);
    expect(clampQuantity(Number.NaN, 10)).toBe(1);
  });

  test("UT-COM-02 (cliente): la cantidad no supera las existencias", () => {
    expect(clampQuantity(15, 4)).toBe(4);
    expect(clampQuantity(2.7, 4)).toBe(2);
    expect(clampQuantity(3, 4)).toBe(3);
  });
});
