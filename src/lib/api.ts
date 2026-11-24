// Cliente HTTP de las rutas de API de Next.js (mismo origen, así viaja la cookie httpOnly de sesión).
const API_BASE = "/api";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string; fields?: Record<string, string> };

export async function api<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: "same-origin",
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (response.ok) return { ok: true, data: body as T };
    return { ok: false, status: response.status, error: body.error ?? "Ocurrió un error inesperado.", fields: body.fields };
  } catch {
    return { ok: false, status: 0, error: "No pudimos conectar con el servidor. Intenta de nuevo." };
  }
}

export const postJson = (body: unknown, method = "POST"): RequestInit => ({ method, body: JSON.stringify(body) });

const pesos = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export const formatPrice = (cents: number) => pesos.format(cents / 100);
