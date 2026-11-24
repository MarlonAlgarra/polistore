"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { buildQuery, readFilters } from "@/lib/filters";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

// Cuadrícula del catálogo según los filtros de la URL.
export function Catalog() {
  const query = buildQuery(readFilters(useSearchParams()));
  const [state, setState] = useState<{ query?: string; products?: Product[]; error?: string }>({});

  useEffect(() => {
    let active = true;
    api<{ products: Product[] }>(`/products${query}`).then((result) => {
      if (active) setState(result.ok ? { query, products: result.data.products } : { query, error: result.error });
    });
    return () => {
      active = false;
    };
  }, [query]);

  if (state.query !== query) return <p aria-busy="true" className="py-12 text-center">Cargando artículos…</p>;
  if (state.error) return <p role="alert" className="card p-6 text-red-800">{state.error}</p>;
  return (
    <section aria-label="Artículos" className="space-y-4">
      <p className="text-sm text-primary/70" role="status">{state.products?.length ?? 0} artículos encontrados</p>
      {state.products?.length === 0 && <p className="card p-6">No hay artículos con esos filtros. Prueba con otros.</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {state.products?.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
