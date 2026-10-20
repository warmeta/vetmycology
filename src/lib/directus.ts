// src/lib/directus.ts
// Directus SDK client with cached fetchers for pages, nav, and site settings.
// Gracefully returns empty/null when Directus is unreachable so the site degrades
// to the hardcoded fallback content during local dev without the CMS running.
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk';

// ── Types ────────────────────────────────────────────────────────────────────

export interface Page {
  id: string;
  slug: string;
  lang: 'es' | 'en';
  title: string;
  description?: string;
  body: string;
  toc: boolean;
  breadcrumb_parent?: string;
  translation_of?: string | null;
  status: 'draft' | 'published';
}

export interface NavItem {
  id: string;
  label_es: string;
  label_en: string;
  href?: string | null;
  parent_id?: string | null;
  sort_order: number;
}

export interface ProcessedNavItem {
  id: string;
  label: string;
  href?: string;
  children?: ProcessedNavItem[];
}

export interface SiteSettings {
  id: number;
  footer_affiliation_es: string;
  footer_affiliation_en: string;
  contact_email: string;
}

type Schema = {
  pages: Page[];
  nav_items: NavItem[];
  site_settings: SiteSettings[];
};

// ── Client ───────────────────────────────────────────────────────────────────

const directusUrl = (import.meta.env as Record<string, string>).DIRECTUS_URL ?? 'http://localhost:8055';
const directusToken = (import.meta.env as Record<string, string>).DIRECTUS_TOKEN;

let client = createDirectus<Schema>(directusUrl).with(rest());
if (directusToken) {
  client = createDirectus<Schema>(directusUrl).with(staticToken(directusToken)).with(rest());
}

// ── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> { data: T; exp: number }
const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 10_000;

async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.exp > now) return hit.data;
  const data = await fn();
  cache.set(key, { data, exp: now + TTL_MS });
  return data;
}

// ── Fetchers ─────────────────────────────────────────────────────────────────

export async function getPage(slug: string, lang: 'es' | 'en'): Promise<Page | null> {
  return cached(`page:${lang}:${slug}`, async () => {
    try {
      const items = await client.request(
        readItems('pages', {
          filter: {
            slug: { _eq: slug },
            lang: { _eq: lang },
            status: { _eq: 'published' },
          },
          limit: 1,
        })
      );
      return (items[0] as Page) ?? null;
    } catch {
      return null;
    }
  });
}

export async function getNav(lang: 'es' | 'en'): Promise<ProcessedNavItem[]> {
  return cached(`nav:${lang}`, async () => {
    try {
      const items = (await client.request(
        readItems('nav_items', { sort: ['sort_order'] })
      )) as NavItem[];

      const roots = items.filter(i => !i.parent_id);
      return roots.map(root => ({
        id: root.id,
        label: lang === 'es' ? root.label_es : root.label_en,
        href: root.href ?? undefined,
        children: items
          .filter(i => i.parent_id === root.id)
          .map(child => ({
            id: child.id,
            label: lang === 'es' ? child.label_es : child.label_en,
            href: child.href ?? undefined,
          })),
      }));
    } catch {
      return [];
    }
  });
}

export async function getSettings(): Promise<SiteSettings | null> {
  return cached('settings', async () => {
    try {
      const items = (await client.request(
        readItems('site_settings', { limit: 1 })
      )) as SiteSettings[];
      return items[0] ?? null;
    } catch {
      return null;
    }
  });
}
