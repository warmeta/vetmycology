#!/usr/bin/env node
/**
 * scripts/migrate-content.ts
 *
 * One-off migration: reads all Markdown files in src/content/ and seeds
 * the Directus `pages` and `nav_items` collections.
 *
 * Prerequisites:
 *   - Directus running and collections (`pages`, `nav_items`, `site_settings`) already created
 *   - An admin static token with write access to those collections
 *   npm install (gray-matter + marked already in devDependencies)
 *
 * Run:
 *   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=<admin-token> \
 *     npx tsx scripts/migrate-content.ts
 *
 * Safe to re-run — uses upsert logic (checks for existing slug+lang before creating).
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? 'http://localhost:8055';
const TOKEN = process.env.DIRECTUS_TOKEN;
if (!TOKEN) { console.error('DIRECTUS_TOKEN env var required'); process.exit(1); }

const CONTENT_DIR = new URL('../src/content', import.meta.url).pathname;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function getExisting(collection: string, filter: Record<string, unknown>) {
  const qs = encodeURIComponent(JSON.stringify(filter));
  const data = await api('GET', `/items/${collection}?filter=${qs}&limit=1`);
  return data?.data?.[0] ?? null;
}

// Converts a collection folder name to a lang + base name.
// "patologias" → { lang: 'es', base: 'patologias' }
// "patologias-en" → { lang: 'en', base: 'patologias' }
function parseFolderLang(folder: string): { lang: 'es' | 'en'; base: string } {
  if (folder.endsWith('-en')) return { lang: 'en', base: folder.slice(0, -3) };
  return { lang: 'es', base: folder };
}

// Converts a filename+collection to a URL slug, e.g.
// folder=patologias, file=levaduras.md → "patologias/levaduras"
function toSlug(base: string, file: string): string {
  return `${base}/${basename(file, extname(file))}`;
}

// ── Pages migration ──────────────────────────────────────────────────────────

async function migratePages() {
  const collections = await readdir(CONTENT_DIR, { withFileTypes: true });
  const folders = collections.filter(d => d.isDirectory() && d.name !== 'pages');

  let created = 0, skipped = 0, errors = 0;

  for (const folder of folders) {
    const { lang, base } = parseFolderLang(folder.name);
    const folderPath = join(CONTENT_DIR, folder.name);
    const files = (await readdir(folderPath)).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const slug = toSlug(base, file);
      const raw = await readFile(join(folderPath, file), 'utf8');
      const { data: fm, content } = matter(raw);
      const body = await marked(content);

      try {
        const existing = await getExisting('pages', {
          slug: { _eq: slug },
          lang: { _eq: lang },
        });

        if (existing) {
          console.log(`  skip  ${lang}:${slug} (id ${existing.id})`);
          skipped++;
          continue;
        }

        const item = await api('POST', '/items/pages', {
          slug,
          lang,
          title: fm.title ?? slug,
          description: fm.description ?? null,
          body,
          toc: fm.toc ?? false,
          breadcrumb_parent: fm.breadcrumb_parent ?? null,
          status: 'published',
        });
        console.log(`  create ${lang}:${slug} → ${item.data?.id}`);
        created++;
      } catch (e) {
        console.error(`  ERROR  ${lang}:${slug}:`, e);
        errors++;
      }
    }
  }

  console.log(`\nPages: ${created} created, ${skipped} skipped, ${errors} errors`);
}

// ── Nav items migration ──────────────────────────────────────────────────────

// Hard-coded nav structure mirrors defaultNav.ts — kept here to avoid an
// import-meta URL resolution issue when running with tsx outside Astro's build.
const NAV_SEED = [
  { label_es: 'Inicio',         label_en: 'Home',         href: '/',                                    parent_key: null },
  { label_es: 'Micología',      label_en: 'Mycology',     href: null,                                   parent_key: null },
  { label_es: 'Generalidades de los hongos', label_en: 'Fungal generalities', href: '/micologia/generalidades/', parent_key: 'Micología' },
  { label_es: 'Grupo de trabajo',            label_en: 'Research group',       href: '/micologia/grupo-de-trabajo/', parent_key: 'Micología' },
  { label_es: 'Colaboración con reptiles',   label_en: 'Reptile collaboration',href: '/micologia/colreptiles/',     parent_key: 'Micología' },
  { label_es: 'Patologías',     label_en: 'Pathologies',  href: null,                                   parent_key: null },
  { label_es: 'Levaduras',      label_en: 'Yeasts',             href: '/patologias/levaduras/',          parent_key: 'Patologías' },
  { label_es: 'Filamentosos',   label_en: 'Filamentous fungi',  href: '/patologias/filamentosos/',       parent_key: 'Patologías' },
  { label_es: 'Dimórficos',     label_en: 'Dimorphic fungi',    href: '/patologias/dimorficos/',         parent_key: 'Patologías' },
  { label_es: 'Micosis peces',  label_en: 'Fish mycoses',       href: '/patologias/micosis-peces/',      parent_key: 'Patologías' },
  { label_es: 'Investigación',  label_en: 'Research',     href: null,                                   parent_key: null },
  { label_es: 'Artículos y congresos',   label_en: 'Articles & congresses', href: '/investigacion/articulos-congresos/',    parent_key: 'Investigación' },
  { label_es: 'Artículos interesantes',  label_en: 'Interesting articles',  href: '/investigacion/articulos-interesantes/', parent_key: 'Investigación' },
  { label_es: 'Laboratorio',    label_en: 'Laboratory',   href: '/laboratorio/',                        parent_key: null },
  { label_es: 'Recursos',       label_en: 'Resources',    href: null,                                   parent_key: null },
  { label_es: 'Archivo de imágenes', label_en: 'Image archive', href: '/recursos/archivo-imagenes/',  parent_key: 'Recursos' },
  { label_es: 'Links micología',     label_en: 'Mycology links', href: '/recursos/links-micologia/',   parent_key: 'Recursos' },
  { label_es: 'Links revistas',      label_en: 'Journal links',  href: '/recursos/links-revistas/',    parent_key: 'Recursos' },
  { label_es: 'Bibliografía',        label_en: 'Bibliography',   href: '/recursos/bibliografia/',      parent_key: 'Recursos' },
];

async function migrateNav() {
  // Check if nav_items already has rows
  const existing = await api('GET', '/items/nav_items?limit=1');
  if (existing?.data?.length) {
    console.log('\nNav items already seeded — skipping.');
    return;
  }

  // First pass: create root items (no parent), collect id map
  const idMap = new Map<string, string>(); // label_es → id
  let order = 0;

  for (const item of NAV_SEED.filter(i => !i.parent_key)) {
    const created = await api('POST', '/items/nav_items', {
      label_es: item.label_es,
      label_en: item.label_en,
      href: item.href ?? null,
      parent_id: null,
      sort_order: order++,
    });
    idMap.set(item.label_es, created.data?.id);
    console.log(`  nav root  "${item.label_es}" → ${created.data?.id}`);
  }

  // Second pass: create children, resolving parent_id
  for (const item of NAV_SEED.filter(i => i.parent_key)) {
    const parentId = idMap.get(item.parent_key!);
    const created = await api('POST', '/items/nav_items', {
      label_es: item.label_es,
      label_en: item.label_en,
      href: item.href ?? null,
      parent_id: parentId ?? null,
      sort_order: order++,
    });
    console.log(`  nav child "${item.label_es}" (parent: ${item.parent_key}) → ${created.data?.id}`);
  }

  console.log('\nNav items seeded.');
}

// ── Site settings ────────────────────────────────────────────────────────────

async function migrateSiteSettings() {
  const existing = await api('GET', '/items/site_settings?limit=1');
  if (existing?.data?.length) {
    console.log('\nSite settings already exist — skipping.');
    return;
  }
  await api('POST', '/items/site_settings', {
    footer_affiliation_es: 'Grupo de Micología Veterinaria · Facultad de Veterinaria · ULPGC',
    footer_affiliation_en: 'Veterinary Mycology Group · Faculty of Veterinary Medicine · ULPGC',
    contact_email: 'begona.acosta@ulpgc.es',
  });
  console.log('\nSite settings seeded.');
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log(`Migrating to ${DIRECTUS_URL}\n`);
console.log('=== Pages ===');
await migratePages();
console.log('\n=== Nav items ===');
await migrateNav();
console.log('\n=== Site settings ===');
await migrateSiteSettings();
console.log('\nDone.');
