# PoliStore — contexto del proyecto

## Qué es
Catálogo virtual (tienda de ropa y artículos deportivos con temática del Politécnico Grancolombiano).
Proyecto académico del curso Desarrollo de Software en Equipo (TSP/PSP), Equipo 9.
Entrega final con producto terminado: 5 de diciembre de 2026.

## Stack real (decisión del equipo, 23/11/2026 — reemplaza React + Flask del Acta 2; ver docs/decisiones.md)
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4. Un solo proyecto: frontend y API.
- API JSON en route handlers bajo `src/app/api/**/route.ts` (rutas `/api/...`).
- Datos: Drizzle ORM + libSQL. Local: `file:data/local.db` (SQLite). Producción (Vercel): Turso.
- Gestor de paquetes: **pnpm, siempre** (respetar pnpm-lock.yaml). Nunca usar npm ni yarn ni crear package-lock.json/yarn.lock.
  Scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm db:migrate`. Paquetes con scripts de instalación se autorizan en
  `pnpm-workspace.yaml` (`allowBuilds`), revisando antes qué hacen.
- Esta versión de Next.js tiene cambios incompatibles con versiones anteriores: antes de escribir código de Next,
  leer la guía correspondiente en `node_modules/next/dist/docs/` (ver AGENTS.md).
- Capas: las páginas y los route handlers llaman a `src/services/`; solo `src/services/` usa `src/db/`.
- No cambiar de stack ni de motor sin autorización explícita.

## Equipo y módulos (Acta 2)
| Módulo                      | Responsable | LOC est. | Inspección de código |
|-----------------------------|-------------|----------|----------------------|
| Catálogo de datos           | Yennifer    | 30       | Jhon Erik            |
| Registro e inicio de sesión | Juan        | 100      | Yennifer             |
| Búsqueda básica             | Juan        | 40       | Yennifer             |
| Búsqueda avanzada           | Jhon Erik   | 80       | Yennifer             |
| Artículos y características | Yennifer    | 120      | Juan                 |
| Compra por artículo         | Marlon      | 60       | Jhon Erik            |
| Carrito de compras          | Marlon      | 100      | Jhon Erik            |
Total estimado: 530 LOC. (Las estimaciones se hicieron pensando en Python + React; registrar la desviación real.)

## Ubicación de archivos por módulo (usada también por scripts/contar_loc.py)
| Módulo                      | Archivos |
|-----------------------------|----------|
| Catálogo de datos           | `src/db/schema.ts`, `src/db/seed.ts` (los datos van en `src/db/seed-data.ts`, que no se cuenta) |
| Registro e inicio de sesión | `src/app/api/auth/**`, `src/services/auth.ts`, `src/lib/session.ts`, `src/app/(auth)/**`, `src/components/auth/**` |
| Búsqueda básica             | `src/lib/search/basic.ts`, `src/components/layout/SearchBar.tsx` |
| Búsqueda avanzada           | `src/lib/search/filters.ts`, `src/components/products/FilterPanel.tsx` |
| Artículos y características | `src/app/api/products/**`, `src/services/products.ts`, `src/components/products/**` (salvo FilterPanel), `src/app/products/**`, `src/app/page.tsx` |
| Compra por artículo         | `src/app/api/orders/**`, `src/services/orders.ts` |
| Carrito de compras          | `src/app/api/cart/**`, `src/services/cart.ts`, `src/components/cart/**`, `src/app/cart/**` |
Si un módulo necesita otro archivo, agregarlo aquí y en el diccionario de `scripts/contar_loc.py`.

## Ciclo de trabajo de cada módulo (fases TSPi)
DLD (diseño detallado) → CODE (código) → CR (revisión personal) → CODEINSP (inspección por un compañero) → UT (prueba unitaria).
Después, integración (IT) y prueba de sistema (ST).

## Reglas de trabajo
1. Una rama por módulo: `feature/<modulo>`. NUNCA hacer push directo a `main`.
2. El código llega a `main` solo después de la inspección del compañero asignado (acuerdo del Acta 2).
3. Commits pequeños y con prefijo: `feat(<modulo>): ...`, `fix(<modulo>): ...`, `test(<modulo>): ...`, `docs: ...`.
   Todo commit que corrija un error debe usar `fix(...)` y explicar en el cuerpo qué estaba mal.
4. Claude Code NO marca como hechas la revisión personal (CR) ni la inspección (CODEINSP): las hace una persona.
   Puede preparar el material (diff, lista de chequeo) y dejarlo para que la persona lo ejecute.
5. Si algo contradice el plan, las actas o este archivo: preguntar antes de seguir.

## Convenciones de la API
- JSON bajo `/api`. Errores siempre como `{"error": "mensaje"}` con el código HTTP correcto (400, 401, 404, 409, 500).
- Producto (campos mínimos expuestos): `id, nombre, marca, categoria, tallas, colores, precio, stock, imagen, descripcion, caracteristicas`.

## Seguridad y calidad mínimas
- Contraseñas con hash (`scrypt` de `node:crypto` o `bcryptjs`), nunca en texto plano.
- Consultas con Drizzle (parametrizadas); nunca SQL armado concatenando texto. Validar y sanear toda entrada.
- Sesión por cookie httpOnly, `SameSite=Lax`, `Secure` en producción, con expiración. Al ser mismo origen, no se necesita CORS.
- Secretos solo en `.env.local` y en las variables de Vercel (nunca en git); mantener `.env.example`.
- Antes de cerrar cada módulo y antes de cada entrega: correr `pnpm audit`, reportar el resultado y NO usar versiones con
  vulnerabilidades conocidas en dependencias de producción. Fijar versiones en package.json/pnpm-lock.yaml.
- Despliegue: el equipo ya tuvo un bloqueo en Vercel (plan gratuito) al desplegar commits de autores que no son
  el owner del proyecto. No cambiar la configuración de despliegue por cuenta propia: proponer la solución y esperar confirmación.

## Pruebas
- Vitest para lógica (services, lib, route handlers) y Vitest + Testing Library para componentes React.
- Las pruebas van junto al código como `*.test.ts` / `*.test.tsx` y se ejecutan con `pnpm test`.

## Registros TSP: SOLO HECHOS REALES  (muy importante)
Se guardan en `docs/tsp/` con las columnas de los formularios del TSPi Workbook para poder pegarlos en el Excel.

### Tiempo (LOGT) → `docs/tsp/LOGT_<iniciales>.csv`
Columnas: `Assembly,Phase,Task,Date,Start,Int,Stop,Comments`
- Assembly = nombre del módulo; Phase = DLD, CODE, CR, CODEINSP, UT, IT, ST, DOC…; Date = dd/mm/aaaa.
- Start y Stop con la hora real del sistema en zona America/Bogota
  (PowerShell: `[TimeZoneInfo]::ConvertTimeBySystemTimeZoneId((Get-Date), 'SA Pacific Standard Time').ToString('dd/MM/yyyy HH:mm')`;
  bash: `TZ=America/Bogota date +"%d/%m/%Y %H:%M"`).
  Registrar Start al comenzar la tarea y Stop al terminar. No estimar, no redondear, no rellenar.
- Int = minutos de interrupción: preguntar a la persona, no suponer.
- El tiempo de sesión es una referencia: la persona revisa y corrige antes de pasarlo al Excel.

### Defectos (LOGD) → `docs/tsp/LOGD_<iniciales>.csv`
Columnas: `Date,Num,Type,Assembly,Injected,Removed,FixTime_min,FixRef,Description`
- Defecto = algo que estaba mal (código, diseño, requisito, documento o entorno) y hubo que cambiar. Una mejora no es un defecto.
- Type: 10 Documentation, 20 Syntax, 30 Build/Package, 40 Assignment, 50 Interface, 60 Checking, 70 Data, 80 Function, 90 System, 100 Environment.
- Injected / Removed = fase donde se introdujo y fase donde se encontró (REQ, HLD, DLD, CODE, CR, CODEINSP, UT, IT, ST).
  Si no se sabe con certeza, escribir `por confirmar`; NO adivinar.
- FixTime_min = minutos reales de corrección (cronometrados o confirmados por la persona). FixRef = hash del commit o enlace.
- Registrar únicamente defectos que realmente ocurrieron y que se puedan respaldar (error visto, test que falló, commit de corrección).
  NO inventar defectos para "llenar" el registro. Cero defectos es un resultado válido.

## Conteo de LOC
Contar solo líneas de lógica en TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`): sin líneas en blanco, sin
comentarios, sin CSS, sin datos semilla (`seed-data.ts`), sin migraciones ni archivos generados, sin archivos de configuración
(`*.config.*`) y sin pruebas (`*.test.*`, que se cuentan aparte).
`scripts/contar_loc.py` imprime las LOC por módulo (mapeo módulo → archivos en un diccionario al inicio del script).
Uso: `python scripts/contar_loc.py`.
Este criterio es una propuesta: confirmarlo con el equipo en el siguiente lanzamiento y dejarlo en el acta.
