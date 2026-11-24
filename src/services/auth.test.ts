import { beforeEach, describe, expect, test } from "vitest";
import type { Db } from "@/db";
import { users } from "@/db/schema";
import { ServiceError } from "@/lib/http";
import { createToken, readToken } from "@/lib/session";
import { createTestDb } from "@/test/db";
import { loginUser, readCredentials, registerUser } from "./auth";

let db: Db;
const ana = { name: "Ana Poli", email: "ana@poli.edu.co", password: "segura123" };

beforeEach(async () => {
  db = await createTestDb();
});

async function expectError(promise: Promise<unknown>, status: number, field?: string) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ServiceError);
  expect((error as ServiceError).status).toBe(status);
  if (field) expect((error as ServiceError).fields).toHaveProperty(field);
}

describe("Módulo 2 - Registro e inicio de sesión", () => {
  test("UT-REG-01: el registro guarda la contraseña con hash, nunca en texto plano", async () => {
    const user = await registerUser(db, ana);
    expect(user).toEqual({ id: expect.any(Number), name: "Ana Poli", email: "ana@poli.edu.co" });
    const [row] = await db.select().from(users);
    expect(row.passwordHash).not.toContain("segura123");
    expect(row.passwordHash).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  test.each(["", "ana", "ana@poli", "ana@@poli.co", "ana poli@poli.co"])(
    "UT-REG-03: rechaza el correo con formato inválido «%s»",
    async (email) => expectError(registerUser(db, { ...ana, email }), 400, "email"),
  );

  test("UT-REG-03: la contraseña debe tener mínimo 8 caracteres", async () => {
    await expectError(registerUser(db, { ...ana, password: "1234567" }), 400, "password");
    await expectError(registerUser(db, { ...ana, password: "x".repeat(129) }), 400, "password");
    await expect(registerUser(db, { ...ana, password: "12345678" })).resolves.toHaveProperty("id");
  });

  test("UT-REG-05: inicia sesión con correo sin importar mayúsculas y rechaza la clave incorrecta", async () => {
    await registerUser(db, ana);
    const credentials = readCredentials({ email: " ANA@poli.edu.co ", password: "segura123" });
    await expect(loginUser(db, credentials)).resolves.toMatchObject({ email: "ana@poli.edu.co" });
    await expectError(loginUser(db, { ...credentials, password: "otra-clave" }), 401);
    await expectError(loginUser(db, { ...credentials, email: "nadie@poli.edu.co" }), 401);
  });

  test("UT-REG-06: no permite registrar dos cuentas con el mismo correo", async () => {
    await registerUser(db, ana);
    await expectError(registerUser(db, { ...ana, email: "ANA@poli.edu.co" }), 409, "email");
  });

  test("UT-REG-07: el token de sesión va firmado, expira y no se puede alterar", () => {
    const now = Date.now();
    const token = createToken(7, now);
    expect(readToken(token, now)).toBe(7);
    expect(readToken(token.replace(/^7\./, "8."), now)).toBeNull();
    expect(readToken(token, now + 8 * 24 * 60 * 60 * 1000)).toBeNull();
    expect(readToken(undefined)).toBeNull();
    expect(readToken("basura")).toBeNull();
  });
});
