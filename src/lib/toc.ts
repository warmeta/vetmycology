// src/lib/toc.ts
// Extracts H2 headings from an HTML body string to build TableOfContents items.
// Assigns slugified IDs so TOC anchors resolve even when the WYSIWYG doesn't set id attrs.

export interface TocItem {
  id: string;
  label: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function extractTocItems(html: string): TocItem[] {
  const items: TocItem[] = [];
  // Match <h2> tags — capture the id attr if present, then the inner text
  const h2Re = /<h2(?:[^>]*\sid="([^"]*)"[^>]*)?>([^<]*(?:<(?!\/h2>)[^<]*)*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  const seenIds = new Set<string>();

  while ((match = h2Re.exec(html)) !== null) {
    const existingId = match[1] ?? '';
    const rawLabel = match[2].replace(/<[^>]+>/g, '').trim();
    if (!rawLabel) continue;

    let id = existingId || slugify(rawLabel);
    // Deduplicate ids
    let candidate = id;
    let n = 1;
    while (seenIds.has(candidate)) candidate = `${id}-${n++}`;
    seenIds.add(candidate);

    items.push({ id: candidate, label: rawLabel });
  }
  return items;
}

// Inject id attributes into h2 elements that don't already have them,
// so anchor links work when the HTML is rendered via set:html.
export function injectHeadingIds(html: string): string {
  const seen = new Set<string>();
  return html.replace(/<h2((?:[^>]*(?!\bid=)[^>])*)>/gi, (_match, attrs) => {
    const existingId = /\bid="([^"]*)"/.exec(attrs)?.[1];
    if (existingId) { seen.add(existingId); return _match; }
    const textAfter = html.slice(html.indexOf(_match) + _match.length);
    const rawLabel = textAfter.replace(/<[^>]+>/g, '').slice(0, 80).split('<')[0].trim();
    let id = slugify(rawLabel);
    let candidate = id;
    let n = 1;
    while (seen.has(candidate)) candidate = `${id}-${n++}`;
    seen.add(candidate);
    return `<h2${attrs} id="${candidate}">`;
  });
}
