"use client";

import { useState } from "react";
import { clampQuantity } from "@/lib/quantity";

type Props = { value: number; max: number; label: string; onCommit: (quantity: number) => void; className?: string };

// Campo de cantidad: deja escribir libremente y ajusta a 1..existencias al salir del campo o con Enter.
export function QuantityInput({ value, max, label, onCommit, className = "" }: Props) {
  const [draft, setDraft] = useState(String(value));
  function commit() {
    const next = clampQuantity(Number(draft), max);
    setDraft(String(next));
    if (next !== value) onCommit(next);
  }
  return (
    <input type="number" inputMode="numeric" min={1} max={max} value={draft} aria-label={label} className={className}
      onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} />
  );
}
