# PoliStore

Tienda virtual de ropa deportiva universitaria. Proyecto universitario en equipo.

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Drizzle ORM + SQLite (libSQL/Turso). Despliegue en Vercel.

## Paleta de colores

| Uso          | Color     | Clase Tailwind     |
| ------------ | --------- | ------------------ |
| Principal    | `#0f385a` | `bg-primary`       |
| Secundario 1 | `#3db2de` | `bg-secondary`     |
| Secundario 2 | Blanco    | `bg-white`         |

Definidos en `src/app/globals.css`.

## Estructura

```
src/
  app/             Rutas y páginas (App Router). Las rutas de API van en app/api
  components/
    ui/            Componentes genéricos (botón, input, tarjeta)
    layout/        Header, footer, navegación
    products/      Componentes propios del catálogo
  db/
    schema.ts      Tablas (Drizzle)
    index.ts       Conexión a la base de datos
    migrations/    Migraciones generadas
  services/        Lógica de negocio y consultas (ej. products.ts)
  lib/             Utilidades y constantes
  types/           Tipos compartidos
data/              Base SQLite local (ignorada por git)
public/images/     Imágenes estáticas
```

Regla simple: las páginas llaman a `services/`, y `services/` es la única capa que usa `db/`.

## SQLite en Vercel

El disco de Vercel es de solo lectura/efímero, así que un archivo `.db` no persiste en producción.
Por eso usamos **libSQL**: mismo SQLite, pero con un servidor remoto gratuito ([Turso](https://turso.tech)).

- Local: `DATABASE_URL=file:data/local.db` (archivo SQLite normal).
- Producción: `DATABASE_URL` y `DATABASE_AUTH_TOKEN` configuradas en las variables de entorno de Vercel.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local
npm run dev
```

Comandos de base de datos: `npm run db:generate` (crear migración), `npm run db:migrate` (aplicarla), `npm run db:studio`.
