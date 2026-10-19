// src/content.config.ts
// NOTE: This file must be at src/content.config.ts (Astro 6+ location).
//       Do NOT use src/content/config.ts — that is the Astro 4 path which silently
//       produces no collections in Astro 6+.
// Source: RESEARCH.md Pattern 1 + 02-UI-SPEC.md URL + Slug Map
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'; // Astro 6+ imports z from astro/zod, NOT astro:content

// Shared schema for all content collections
const contentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  toc: z.boolean().default(false),
  lang: z.enum(['es', 'en']).default('es'),
  breadcrumb_parent: z.string().optional(),
});

const micologia = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/micologia' }),
  schema: contentSchema,
});

const patologias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patologias' }),
  schema: contentSchema,
});

const investigacion = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/investigacion' }),
  schema: contentSchema,
});

const laboratorio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/laboratorio' }),
  schema: contentSchema,
});

const recursos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos' }),
  schema: contentSchema,
});

// EN content collections — parallel to ES collections, same schema, -en suffix base paths
const micologiaEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/micologia-en' }),
  schema: contentSchema,
});

const patologiasEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/patologias-en' }),
  schema: contentSchema,
});

const investigacionEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/investigacion-en' }),
  schema: contentSchema,
});

const laboratorioEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/laboratorio-en' }),
  schema: contentSchema,
});

const recursosEn = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recursos-en' }),
  schema: contentSchema,
});

export const collections = {
  micologia, patologias, investigacion, laboratorio, recursos,
  'micologia-en': micologiaEn,
  'patologias-en': patologiasEn,
  'investigacion-en': investigacionEn,
  'laboratorio-en': laboratorioEn,
  'recursos-en': recursosEn,
};
