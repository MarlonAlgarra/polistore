// Parámetros de búsqueda: los mismos nombres en el cliente y en la API (p. ej. "talla").
export const FILTER_KEYS = ["q", "marca", "talla", "color", "categoria", "precioMin", "precioMax"] as const;

export type Filters = Partial<Record<(typeof FILTER_KEYS)[number], string>>;

export function buildQuery(filters: Filters): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key]?.trim();
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function readFilters(params: URLSearchParams): Filters {
  return Object.fromEntries(FILTER_KEYS.flatMap((key) => (params.get(key) ? [[key, params.get(key)]] : [])));
}
