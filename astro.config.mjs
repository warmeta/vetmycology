// @ts-check
// astro.config.mjs
// Source: https://docs.astro.build/en/guides/internationalization/
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // confirmed with webmaster: root domain, no base needed
  site: 'https://micologiaveterinaria.ulpgc.es',

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

  integrations: [sitemap()],
});