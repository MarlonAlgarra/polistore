"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CATEGORIES = ["Camisetas", "Sudaderas", "Chaquetas", "Pantalonetas", "Gorras", "Accesorios"];

// Menú por categorías, visible en todas las pantallas.
export function CategoryMenu() {
  const active = useSearchParams().get("categoria");
  return (
    <nav aria-label="Categorías" className="flex gap-1 overflow-x-auto">
      {["Todo", ...CATEGORIES].map((name) => {
        const isActive = name === "Todo" ? !active : active === name;
        return (
          <Link key={name} href={name === "Todo" ? "/" : `/?categoria=${name}`} aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap border-b-4 px-3 py-2 text-sm font-semibold ${isActive ? "border-secondary" : "border-transparent hover:border-white/40"}`}>
            {name}
          </Link>
        );
      })}
    </nav>
  );
}
