import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { href, ui, type Lang } from './i18n';

export const SITE = {
  name: 'Belagavi City',
  domain: 'belagavicity.com',
  url: 'https://belagavicity.com',
  tagline: 'Local businesses in Belagavi (Belgaum)',
  // TODO: replace with a working inbox before launch.
  contactEmail: 'hello@belagavicity.com',
};

export const GROUPS: Record<CollectionEntry<'categories'>['data']['group'], string> = {
  home: 'Home services',
  health: 'Health',
  events: 'Weddings & events',
  professional: 'Professional services',
  tech: 'Computers & tech',
  local: 'Only in Belagavi',
};

export type Business = CollectionEntry<'businesses'>;

/** Featured first, then verified, then by name. */
export function sortBusinesses(list: Business[]) {
  return [...list].sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      Number(b.data.verified) - Number(a.data.verified) ||
      a.data.name.localeCompare(b.data.name),
  );
}

/** True if the business is based in the area or lists it in `alsoServes`. */
export function servesArea(b: Business, areaId: string) {
  return b.data.area.id === areaId || b.data.alsoServes.some((a) => a.id === areaId);
}

/** Home area first, then any `alsoServes` areas. */
export function areaIdsOf(b: Business) {
  return [b.data.area.id, ...b.data.alsoServes.map((a) => a.id)];
}

/** True if the business's main category is this one or it lists it in `alsoListedIn`. */
export function inCategory(b: Business, categoryId: string) {
  return b.data.category.id === categoryId || b.data.alsoListedIn.some((c) => c.id === categoryId);
}

/** Main category first, then any `alsoListedIn` categories. */
export function categoryIdsOf(b: Business) {
  return [b.data.category.id, ...b.data.alsoListedIn.map((c) => c.id)];
}

export async function getLiveCategories() {
  return getCollection('categories', (c) => c.data.live);
}

export async function getBusinesses(filter?: { category?: string; area?: string }) {
  const all = await getCollection(
    'businesses',
    (b) =>
      (!filter?.category || inCategory(b, filter.category)) &&
      (!filter?.area || servesArea(b, filter.area)),
  );
  return sortBusinesses(all);
}

/**
 * Every "service in area" page: one per live category and area with at least one
 * listing. Empty pages would be thin content and hurt the whole site in search.
 */
export async function getCategoryAreaPaths() {
  const paths = [];
  for (const category of await getLiveCategories()) {
    const businesses = await getBusinesses({ category: category.id });
    const areaIds = [...new Set(businesses.flatMap(areaIdsOf))];
    for (const areaId of areaIds) {
      paths.push({
        params: { category: category.id, area: areaId },
        props: { category, area: await getArea(areaId), businesses: businesses.filter((b) => servesArea(b, areaId)) },
      });
    }
  }
  return paths;
}

export async function getArea(id: string) {
  const area = await getEntry('areas', id);
  if (!area) throw new Error(`Unknown area: ${id}`);
  return area;
}

export async function getCategory(id: string) {
  const category = await getEntry('categories', id);
  if (!category) throw new Error(`Unknown category: ${id}`);
  return category;
}

/** "0000000000" -> "+910000000000" for tel: and wa.me links. */
export function intlPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

export function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, '').slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
}

export type Crumb = { name: string; href: string };

/** `items` hrefs already carry the language prefix. */
export function breadcrumbJsonLd(items: Crumb[], lang: Lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: ui(lang).home, href: href(lang, '/') }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.href, SITE.url).href,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Lowercases a category name for use mid-sentence, keeping acronyms: "AC & Appliance Repair" -> "AC & appliance repair". */
export function lower(name: string) {
  return name
    .split(' ')
    .map((w) => (/^[A-Z]{2,}/.test(w) ? w : w.toLowerCase()))
    .join(' ');
}

/** Schema.org `areaServed` for the whole city, with its old name so "Belgaum" searches match. */
export const CITY = { '@type': 'City', name: 'Belagavi', alternateName: 'Belgaum' };

/** Lowercases only the first word, keeping acronyms: "Dental check-ups" -> "dental check-ups", "AC servicing" stays. */
export function lowerFirst(text: string) {
  return /^[A-Z]{2,}/.test(text) ? text : text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * "3 electricians", "1 dentist". Categories without a plural noun name
 * ("AC & Appliance Repair") fall back to "1 business" / "3 businesses"
 * (in Kannada, "… ಸೇವಾದಾರರು", service providers).
 */
export function countLabel(category: CollectionEntry<'categories'>, n: number, lang: Lang = 'en') {
  const { name, singular, kn } = category.data;
  if (lang === 'kn') {
    if (singular === name) return `${n} ${kn.name} ಸೇವಾದಾರರು`;
    return `${n} ${n === 1 ? kn.singular : kn.name}`;
  }
  if (singular === name) return `${n} ${n === 1 ? 'business' : 'businesses'}`;
  return `${n} ${lower(n === 1 ? singular : name)}`;
}

/** ["Camp", "Vadgaon", "Angol"] -> "Camp, Vadgaon and Angol". */
export function listNames(names: string[], lang: Lang = 'en') {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} ${ui(lang).and} ${names.at(-1)}` : (names[0] ?? '');
}

/** Lists the businesses shown on a page. Sample listings are left out. */
export function itemListJsonLd(businesses: Business[], lang: Lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: businesses
      .filter((b) => !b.data.sample)
      .map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.data.name,
        url: new URL(href(lang, `/business/${b.id}/`), SITE.url).href,
      })),
  };
}
