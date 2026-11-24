"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, postJson } from "@/lib/api";

type Mode = "login" | "registro";
const EMAIL = { name: "email", label: "Correo electrónico", type: "email", auto: "email" };
const FIELDS: Record<Mode, (typeof EMAIL)[]> = {
  login: [EMAIL, { name: "password", label: "Contraseña", type: "password", auto: "current-password" }],
  registro: [
    { name: "name", label: "Nombre completo", type: "text", auto: "name" },
    EMAIL,
    { name: "password", label: "Contraseña (mínimo 8 caracteres)", type: "password", auto: "new-password" },
  ],
};

// Formulario de registro e inicio de sesión: cada campo tiene su etiqueta asociada por id.
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/";
  const [errors, setErrors] = useState<{ message?: string; fields?: Record<string, string> }>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const result = await api(`/auth/${mode === "login" ? "login" : "register"}`, postJson(form));
    setPending(false);
    if (!result.ok) return setErrors({ message: result.error, fields: result.fields });
    const target = new URL(next, window.location.origin);
    router.push(target.origin === window.location.origin ? `${target.pathname}${target.search}` : "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card mx-auto w-full max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-bold">{mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h1>
      {FIELDS[mode].map((field) => (
        <div key={field.name} className="space-y-1">
          <label htmlFor={`${mode}-${field.name}`} className="block text-sm font-semibold">{field.label}</label>
          <input id={`${mode}-${field.name}`} name={field.name} type={field.type} autoComplete={field.auto} required
            minLength={mode === "registro" && field.type === "password" ? 8 : undefined} className="input"
            aria-invalid={Boolean(errors.fields?.[field.name])} aria-describedby={`${mode}-${field.name}-error`} />
          <p id={`${mode}-${field.name}-error`} className="text-sm text-red-700">{errors.fields?.[field.name]}</p>
        </div>
      ))}
      {errors.message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errors.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Enviando…" : mode === "login" ? "Ingresar" : "Registrarme"}
      </button>
      <p className="text-center text-sm">
        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link href={`/${mode === "login" ? "registro" : "login"}?next=${encodeURIComponent(next)}`} className="link">
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </form>
  );
}
