"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { buildQuery } from "@/lib/filters";

// Búsqueda básica por nombre, visible en todas las pantallas.
export function SearchBar() {
  const router = useRouter();
  const q = useSearchParams().get("q") ?? "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/${buildQuery({ q: String(new FormData(event.currentTarget).get("q") ?? "") })}`);
  }

  return (
    <form role="search" onSubmit={handleSubmit} key={q} className="flex w-full max-w-xl">
      <label htmlFor="buscar" className="sr-only">Buscar artículos por nombre</label>
      <input id="buscar" name="q" type="search" defaultValue={q} placeholder="Buscar camisetas, gorras, sudaderas…"
        className="w-full rounded-l-full border-0 bg-white px-5 py-2.5 text-primary outline-none ring-secondary focus:ring-2" />
      <button type="submit" className="rounded-r-full bg-secondary px-5 font-bold text-primary hover:bg-sky-300">Buscar</button>
    </form>
  );
}
