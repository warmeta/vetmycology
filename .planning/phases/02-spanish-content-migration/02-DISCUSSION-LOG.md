# Phase 2: Spanish Content Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-18
**Phase:** 02-spanish-content-migration
**Areas discussed:** Identidad visual, Navegación, Layout de páginas, Archivos fuente

---

## Identidad visual

### Color palette

| Option | Description | Selected |
|--------|-------------|----------|
| Verde bosque oscuro (#2D6A4F) | Institucional, serio, contraste 7:1. Acento #52B788 verde menta. | ✓ |
| Verde teal/musgo (#2A7F62) | Más contemporáneo, entre verde y azul. | |
| Verde salvia (#606C38) | Más tierra, fondo crema. Cálido y orgánico. | |

**User's choice:** Verde bosque oscuro
**Notes:** "Algo moderno y accesible, paleta de colores en que incluya verde"

### Tipografía

| Option | Description | Selected |
|--------|-------------|----------|
| Inter + Source Serif 4 | Inter para UI/cuerpo, Source Serif 4 para headings. Académico legible. | ✓ |
| DM Sans + DM Serif Display | Pareja moderna de la familia DM. Más contemporáneo. | |
| Solo sistema (system-ui) | Sin Google Fonts. Carga instantánea. | |

**User's choice:** Inter + Source Serif 4
**Notes:** "Fuente legible y accesible con tono de investigación"

---

## Navegación

### Desktop behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hover dropdown (CSS puro) | :hover + :focus-within. Clásico y rápido. | ✓ |
| Click dropdown | JS mínimo para toggle. Más predecible en táctil. | |

**User's choice:** Hover dropdown

### Grupos del menú

| Option | Description | Selected |
|--------|-------------|----------|
| 6 clusters propuestos | Inicio, Micología, Patologías, Investigación, Laboratorio, Recursos | ✓ |
| Cambiar algo | Alguna sección en otro grupo o nombre diferente | |

**User's choice:** Sí, es correcta

### Menú móvil

| Option | Description | Selected |
|--------|-------------|----------|
| Overlay full-screen | Panel pantalla completa con acordeón. Fácil de tocar. | ✓ |
| Drawer lateral | Panel que desliza desde la izquierda. | |

**User's choice:** Overlay full-screen

---

## Layout de páginas

| Option | Description | Selected |
|--------|-------------|----------|
| Columna única + TOC arriba | max-width 740px. TOC como lista antes del contenido. Simple, móvil-first. | ✓ |
| Columna + TOC sticky lateral | TOC fijo a la derecha en desktop. Más complejo. | |

**User's choice:** Columna única + TOC arriba

---

## Archivos fuente HTM

**User provided location:** `~/Downloads/backup/` — contiene toda la web y las imágenes del sitio actual.
**Notes:** "Tienes toda la web e imágenes actuales en /Downloads/backup. Intenta obviar los gifs por ahora, pero mantén los textos sobre todo y las imágenes."

Contenido confirmado en backup:
- 31 ficheros .htm (todas las secciones del sitio)
- Imágenes JPG/PNG científicas
- PDFs (CV, protocolos, artículos)
- GIFs decorativos → excluir

---

## Claude's Discretion

- Nombres exactos de CSS Custom Properties
- Combinaciones de pesos de fuente más allá de Inter 400/600 y Serif 400/700
- Detalles de layout del footer
- Presentación de páginas de listados (bibliografía, links)

## Deferred Ideas

- Breadcrumbs — Phase 4
- Language switcher funcional — Phase 3
- hreflang tags — Phase 3
- Print stylesheet — v2
- Dark mode — out of scope
