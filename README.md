# VetMyc — Grupo de Micología Veterinaria · ULPGC

Sitio web del Grupo de Micología Veterinaria de la Facultad de Veterinaria de la Universidad de Las Palmas de Gran Canaria.

**URL:** https://micologiaveterinaria.ulpgc.es

## Stack

- [Astro](https://astro.build) 7 — generador de sitios estáticos
- Plain CSS con CSS Custom Properties — sin Tailwind ni preprocesadores
- Markdown con Content Collections — sin CMS
- Bilingüe ES + EN con i18n routing nativo de Astro

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # previsualiza dist/ localmente
```

## Estructura

```
src/
  content/          # Markdown por colección (micologia, patologias, etc.)
  components/       # Header, Footer, Nav, Breadcrumb, TableOfContents…
  layouts/          # BaseLayout, ContentPage, ImageArchive
  pages/            # Rutas Astro (ES en raíz, EN bajo /en/)
  styles/           # global.css — tokens de diseño
  i18n/             # ui.ts — diccionario de traducciones
public/
  docs/             # PDFs servidos estáticamente
  images/           # Logos y fotos
.github/workflows/
  deploy.yml        # CI: build → push a rama prod
```

## Despliegue

El deploy es automático vía GitHub Actions al hacer push a `main`:

1. Actions construye el sitio (`npm run build`)
2. Sube el contenido de `dist/` a la rama `prod` bajo `public/`
3. Plesk detecta el cambio en `prod` y sincroniza `/httpdocs/public/`

Para desplegar manualmente: hacer pull desde Plesk → Git del dominio.

## Contenido

El contenido se edita directamente en los ficheros Markdown de `src/content/`. Cada fichero tiene frontmatter con `title`, `description`, `toc`, `lang` y `breadcrumb_parent`.

Las traducciones al inglés están en las colecciones con sufijo `-en` (e.g. `micologia-en/`).
