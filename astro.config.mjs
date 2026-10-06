// @ts-check
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/internationalization/
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://micologiaveterinaria.ulpgc.es', // confirm URL with webmaster; use subdirectory base if needed
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
      // NOTE: The default redirect behavior is intentionally left at its default (false in Astro 6+).
      // Do not add any redirect options here — see 01-RESEARCH.md Pitfall 1 and Anti-Patterns.
    },
  },
  build: {
    format: 'directory', // produces dist/about/index.html — Apache serves with default DirectoryIndex
  },
});
