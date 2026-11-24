import { Suspense } from "react";
import { Catalog } from "@/components/products/Catalog";
import { FiltersPanel } from "@/components/products/FiltersPanel";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-primary to-[#1b5a8a] px-6 py-8 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary">Colección 2026</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Viste los colores del Poli</h1>
        <p className="mt-2 max-w-xl text-white/80">Ropa deportiva y accesorios oficiales del Politécnico Grancolombiano.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <Suspense><FiltersPanel /></Suspense>
        </aside>
        <Suspense fallback={<p className="py-12 text-center">Cargando artículos…</p>}>
          <Catalog />
        </Suspense>
      </div>
    </div>
  );
}
