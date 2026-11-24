import { db } from "@/db";
import { readJson, respond, ServiceError } from "@/lib/http";
import { endSession, getSessionUserId, startSession } from "@/lib/session";
import { findUser, loginUser, readCredentials, registerUser } from "@/services/auth";

// POST /api/auth/register | /login | /logout
export async function POST(request: Request, { params }: RouteContext<"/api/auth/[action]">) {
  const { action } = await params;
  return respond(async () => {
    if (action === "logout") return endSession().then(() => ({ ok: true }));
    if (action !== "register" && action !== "login") throw new ServiceError("Recurso no encontrado.", 404);
    const credentials = readCredentials(await readJson(request));
    const user = action === "register" ? await registerUser(db, credentials) : await loginUser(db, credentials);
    await startSession(user.id);
    return { user };
  }, action === "register" ? 201 : 200);
}

// GET /api/auth/me: usuario de la sesión actual
export async function GET(_request: Request, { params }: RouteContext<"/api/auth/[action]">) {
  const { action } = await params;
  return respond(async () => {
    const user = action === "me" ? await findUser(db, await getSessionUserId()) : null;
    if (!user) throw new ServiceError(action === "me" ? "No has iniciado sesión." : "Recurso no encontrado.", action === "me" ? 401 : 404);
    return { user };
  });
}
