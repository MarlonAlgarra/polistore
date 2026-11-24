import { unstable_rethrow } from "next/navigation";

// Utilidades de las rutas de API: errores de negocio con su código HTTP y respuestas JSON uniformes.
export class ServiceError extends Error {
  constructor(message: string, readonly status = 400, readonly fields?: Record<string, string>) {
    super(message);
  }
}

export async function respond(action: () => Promise<unknown>, status = 200): Promise<Response> {
  try {
    return Response.json(await action(), { status });
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ServiceError) {
      return Response.json({ error: error.message, fields: error.fields }, { status: error.status });
    }
    console.error("Error no controlado en la API", error);
    return Response.json({ error: "Ocurrió un error en el servidor. Intenta de nuevo." }, { status: 500 });
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => null);
  return body !== null && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
}
