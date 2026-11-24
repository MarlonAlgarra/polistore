import { eq } from "drizzle-orm";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Db } from "@/db";
import { users } from "@/db/schema";
import { ServiceError } from "@/lib/http";
import type { User } from "@/types";

const scryptAsync = promisify(scrypt) as (password: string, salt: string, length: number) => Promise<Buffer>;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-zA-Z]{2,}$/;
export const MIN_PASSWORD = 8;
const MAX_LENGTH = { name: 100, email: 254, password: 128 };
const DUMMY_HASH = `${"0".repeat(32)}:${"0".repeat(128)}`;
export type Credentials = { name?: string; email: string; password: string };
const publicFields = { id: users.id, name: users.name, email: users.email };

export function readCredentials(body: Record<string, unknown>): Credentials {
  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");
  return { name: text("name").trim(), email: text("email").trim().toLowerCase(), password: text("password") };
}

// Valida el registro en el servidor: nombre, correo con formato válido y contraseña de 8+ caracteres.
export function validateRegistration({ name, email, password }: Credentials): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!name || name.length > MAX_LENGTH.name) fields.name = "Escribe tu nombre (máximo 100 caracteres).";
  if (email.length > MAX_LENGTH.email || !EMAIL_RE.test(email)) fields.email = "Escribe un correo válido, por ejemplo nombre@poli.edu.co.";
  if (password.length < MIN_PASSWORD || password.length > MAX_LENGTH.password) {
    fields.password = `La contraseña debe tener entre ${MIN_PASSWORD} y ${MAX_LENGTH.password} caracteres.`;
  }
  return fields;
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await scryptAsync(password, salt, 64)).toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt = "", hash = ""] = stored.split(":");
  const actual = await scryptAsync(password.slice(0, MAX_LENGTH.password), salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

export async function registerUser(db: Db, credentials: Credentials): Promise<User> {
  const fields = validateRegistration(credentials);
  if (Object.keys(fields).length > 0) throw new ServiceError("Revisa los datos del formulario.", 400, fields);
  const { name = "", email, password } = { ...credentials, email: credentials.email.toLowerCase() };
  const taken = new ServiceError("Ya existe una cuenta con ese correo.", 409, { email: "Este correo ya está registrado." });
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (existing) throw taken;
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning(publicFields).catch((error: unknown) => {
    throw String(error).includes("UNIQUE") ? taken : error;
  });
  return user;
}

export async function loginUser(db: Db, { email, password }: Credentials): Promise<User> {
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  const isValid = await verifyPassword(password, row?.passwordHash ?? DUMMY_HASH);
  if (!row || !isValid) {
    throw new ServiceError("Correo o contraseña incorrectos.", 401);
  }
  return { id: row.id, name: row.name, email: row.email };
}

export async function findUser(db: Db, userId: number | null): Promise<User | null> {
  if (userId === null) return null;
  const [user] = await db.select(publicFields).from(users).where(eq(users.id, userId));
  return user ?? null;
}
