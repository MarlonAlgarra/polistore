// La cantidad empieza en 1 y queda entre 1 y las existencias del artículo.
export const INITIAL_QUANTITY = 1;

export function clampQuantity(value: number, stock: number): number {
  if (!Number.isFinite(value)) return INITIAL_QUANTITY;
  return Math.min(Math.max(INITIAL_QUANTITY, Math.trunc(value)), Math.max(INITIAL_QUANTITY, stock));
}
