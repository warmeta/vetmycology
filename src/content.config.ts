// src/content.config.ts
// NOTE: This file must be at src/content.config.ts (Astro 6+ location).
//       Do NOT use src/content/config.ts — that is the Astro 4 path which silently
//       produces no collections in Astro 6+.
// Source: https://docs.astro.build/en/guides/content-collections/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'; // Astro 6+ imports z from astro/zod, NOT astro:content

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    locale: z.enum(['es', 'en']).default('es'),
  }),
});

export const collections = { pages };
