// @ts-check
// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://micologiaveterinaria.ulpgc.es',

  output: 'server',
  adapter: node({ mode: 'standalone' }),

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  build: {
    format: 'directory',
  },
});