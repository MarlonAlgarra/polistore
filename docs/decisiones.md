# Decisiones técnicas — PoliStore

## D1 · Stack: Next.js en lugar de React + Flask (23/11/2026)

**Contexto.** El Acta 2 (16/11/2026) acordó React en el frontend y Python con Flask en el backend.
El repositorio ya estaba construido con Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + Drizzle ORM + libSQL,
desplegado en Vercel con base de datos Turso en producción y SQLite en archivo en local.

**Decisión.** Se mantiene el stack real del repositorio. El frontend sigue siendo React (Next.js es un framework de React)
y la API JSON se implementa con route handlers de Next.js bajo `/api`, en el mismo proyecto.

**Consecuencias.**
- Un solo proyecto y un solo comando para correrlo en local (`pnpm dev`); no hace falta CORS.
- Las pruebas usan Vitest (+ Testing Library) en lugar de pytest.
- El conteo de LOC se hace sobre TypeScript/TSX. Las estimaciones del Acta 2 se hicieron pensando en Python + React:
  la desviación se registra y se analiza al cierre.
- Pendiente: registrar este cambio en la próxima acta de reunión con la aprobación del equipo.

## D2 · Precio en centavos (pendiente de confirmar)

El esquema actual guarda `priceCents` (entero). Pendiente: confirmar con el equipo si se mantiene en la base de datos
y se expone como `precio` en la API.
