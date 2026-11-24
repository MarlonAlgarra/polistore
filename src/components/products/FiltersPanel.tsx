"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/api";
import { buildQuery, readFilters } from "@/lib/filters";

type Options = Record<"marca" | "talla" | "color" | "categoria", string[]>;
const SELECTS = [["marca", "Marca"], ["talla", "Talla"], ["color", "Color"], ["categoria", "Categoría"]] as const;

// Búsqueda avanzada: los filtros se combinan entre sí (marca, talla, color, categoría y precio).
export function FiltersPanel() {
  const router = useRouter();
  const current = readFilters(useSearchParams());
  const [options, setOptions] = useState<Options | null>(null);

  useEffect(() => {
    api<Options>("/products/filtros").then((result) => result.ok && setOptions(result.data));
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    router.push(`/${buildQuery({ q: current.q, ...form })}`);
  }

  return (
    <form onSubmit={handleSubmit} key={`${buildQuery(current)}|${options ? "listo" : "cargando"}`} aria-label="Filtros de búsqueda" className="card space-y-4 p-5">
      <h2 className="text-lg font-bold">Filtrar artículos</h2>
      {SELECTS.map(([name, label]) => (
        <div key={name} className="space-y-1">
          <label htmlFor={`filtro-${name}`} className="block text-sm font-semibold">{label}</label>
          <select id={`filtro-${name}`} name={name} defaultValue={current[name] ?? ""} className="input">
            <option value="">Todas</option>
            {options?.[name].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      ))}
      <fieldset className="space-y-1">
        <legend className="text-sm font-semibold">Precio (COP)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input name="precioMin" type="number" min={0} step={1000} placeholder="Mínimo" aria-label="Precio mínimo"
            defaultValue={current.precioMin} className="input" />
          <input name="precioMax" type="number" min={0} step={1000} placeholder="Máximo" aria-label="Precio máximo"
            defaultValue={current.precioMax} className="input" />
        </div>
      </fieldset>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Aplicar</button>
        <button type="button" onClick={() => router.push("/")} className="btn-secondary">Limpiar</button>
      </div>
    </form>
  );
}
