"""Cuenta LOC de lógica por módulo de PoliStore.

Criterio (propuesta, ver CLAUDE.md > Conteo de LOC):
- Solo .ts, .tsx, .js, .jsx, .mjs.
- Sin líneas en blanco ni comentarios (//, /* */, {/* */} de JSX).
- Excluye pruebas (*.test.*, *.spec.*), que se reportan aparte, datos semilla,
  migraciones, archivos generados y de configuración.

Uso (desde la raíz del repo):  python scripts/contar_loc.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Mapeo módulo -> patrones de archivos (relativos a la raíz, estilo glob con **).
# Mantener sincronizado con la tabla "Ubicación de archivos por módulo" de CLAUDE.md.
MODULOS: dict[str, dict] = {
    "Catálogo de datos": {
        "estimado": 30,
        "incluir": ["src/db/schema.ts", "src/db/seed.ts"],
    },
    "Registro e inicio de sesión": {
        "estimado": 100,
        "incluir": [
            "src/app/api/auth/**",
            "src/services/auth.ts",
            "src/lib/session.ts",
            "src/app/(auth)/**",
            "src/components/auth/**",
        ],
    },
    "Búsqueda básica": {
        "estimado": 40,
        "incluir": ["src/lib/search/basic.ts", "src/components/layout/SearchBar.tsx"],
    },
    "Búsqueda avanzada": {
        "estimado": 80,
        "incluir": ["src/lib/search/filters.ts", "src/components/products/FilterPanel.tsx"],
    },
    "Artículos y características": {
        "estimado": 120,
        "incluir": [
            "src/app/api/products/**",
            "src/services/products.ts",
            "src/components/products/**",
            "src/app/products/**",
            "src/app/page.tsx",
        ],
        "excluir": ["src/components/products/FilterPanel.tsx"],
    },
    "Compra por artículo": {
        "estimado": 60,
        "incluir": ["src/app/api/orders/**", "src/services/orders.ts"],
    },
    "Carrito de compras": {
        "estimado": 100,
        "incluir": [
            "src/app/api/cart/**",
            "src/services/cart.ts",
            "src/components/cart/**",
            "src/app/cart/**",
        ],
    },
}

EXTENSIONES = {".ts", ".tsx", ".js", ".jsx", ".mjs"}
EXCLUIR_SIEMPRE = [
    "node_modules/**",
    ".next/**",
    "src/db/migrations/**",
    "src/db/seed-data.ts",
    "**/*.config.*",
    "**/*.d.ts",
]
PATRON_PRUEBA = re.compile(r"\.(test|spec)\.[jt]sx?$")
CARPETA_RAIZ_CODIGO = "src"


def glob_a_regex(patron: str) -> re.Pattern[str]:
    """Convierte un glob con ** a regex sobre rutas con '/'."""
    partes = []
    i = 0
    while i < len(patron):
        if patron.startswith("**/", i):
            partes.append("(?:.*/)?")
            i += 3
        elif patron.startswith("**", i):
            partes.append(".*")
            i += 2
        elif patron[i] == "*":
            partes.append("[^/]*")
            i += 1
        else:
            partes.append(re.escape(patron[i]))
            i += 1
    return re.compile("^" + "".join(partes) + "$")


def coincide(ruta: str, patrones: list[str]) -> bool:
    return any(glob_a_regex(p).match(ruta) for p in patrones)


def quitar_comentarios(codigo: str) -> str:
    """Elimina comentarios respetando cadenas ('', "", ``)."""
    salida = []
    i, n = 0, len(codigo)
    while i < n:
        c = codigo[i]
        if c in "'\"`":
            j = i + 1
            while j < n and codigo[j] != c:
                j += 2 if codigo[j] == "\\" else 1
            salida.append(codigo[i : j + 1])
            i = j + 1
        elif codigo.startswith("//", i):
            fin = codigo.find("\n", i)
            i = n if fin == -1 else fin
        elif codigo.startswith("/*", i):
            fin = codigo.find("*/", i + 2)
            fin = n if fin == -1 else fin + 2
            salida.append("\n" * codigo.count("\n", i, fin))
            i = fin
        else:
            salida.append(c)
            i += 1
    return "".join(salida)


def contar_lineas(archivo: Path) -> int:
    texto = quitar_comentarios(archivo.read_text(encoding="utf-8-sig", errors="replace"))
    # Una línea que solo queda con "{}" venía de un comentario JSX {/* ... */}.
    return sum(1 for linea in texto.splitlines() if linea.strip() not in ("", "{}"))


def archivos_de_codigo(raiz: Path) -> list[str]:
    base = raiz / CARPETA_RAIZ_CODIGO
    if not base.is_dir():
        return []
    rutas = []
    for archivo in base.rglob("*"):
        if archivo.is_file() and archivo.suffix in EXTENSIONES:
            rel = archivo.relative_to(raiz).as_posix()
            if not coincide(rel, EXCLUIR_SIEMPRE):
                rutas.append(rel)
    return sorted(rutas)


def desviacion(real: int, estimado: int) -> str:
    if estimado == 0:
        return "-"
    return f"{(real - estimado) / estimado * 100:+.0f} %"


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    raiz = Path(__file__).resolve().parent.parent
    rutas = archivos_de_codigo(raiz)
    asignados: set[str] = set()
    total_real = total_est = total_pruebas = 0

    print(f"{'Módulo':<30} {'Est.':>5} {'Real':>5} {'Desv.':>7} {'Pruebas':>8}")
    print("-" * 60)
    for nombre, cfg in MODULOS.items():
        propios = [
            r for r in rutas
            if coincide(r, cfg["incluir"]) and not coincide(r, cfg.get("excluir", []))
        ]
        asignados.update(propios)
        codigo = [r for r in propios if not PATRON_PRUEBA.search(r)]
        pruebas = [r for r in propios if PATRON_PRUEBA.search(r)]
        real = sum(contar_lineas(raiz / r) for r in codigo)
        loc_pruebas = sum(contar_lineas(raiz / r) for r in pruebas)
        total_real += real
        total_est += cfg["estimado"]
        total_pruebas += loc_pruebas
        print(f"{nombre:<30} {cfg['estimado']:>5} {real:>5} "
              f"{desviacion(real, cfg['estimado']):>7} {loc_pruebas:>8}")
    print("-" * 60)
    print(f"{'TOTAL':<30} {total_est:>5} {total_real:>5} "
          f"{desviacion(total_real, total_est):>7} {total_pruebas:>8}")

    sin_modulo = [r for r in rutas if r not in asignados]
    if sin_modulo:
        print("\nArchivos de código sin módulo asignado (no suman al total):")
        for r in sin_modulo:
            print(f"  {r}: {contar_lineas(raiz / r)} LOC")
    return 0


if __name__ == "__main__":
    sys.exit(main())
