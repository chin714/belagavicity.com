import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export const SITE = {
  name: 'Belagavi City',
  domain: 'belagavicity.com',
  url: 'https://belagavicity.com',
  tagline: 'Local businesses and services in Belagavi',
  // TODO: replace with a working inbox before launch.
  contactEmail: 'hello@belagavicity.com',
};

export const GROUPS: Record<CollectionEntry<'categories'>['data']['group'], string> = {
  home: 'Home services',
  health: 'Health',
  events: 'Weddings & events',
  professional: 'Professional services',
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

export async function getLiveCategories() {
  return getCollection('categories', (c) => c.data.live);
}

export async function getBusinesses(filter?: { category?: string; area?: string }) {
  const all = await getCollection(
    'businesses',
    (b) =>
      (!filter?.category || b.data.category.id === filter.category) &&
      (!filter?.area || b.data.area.id === filter.area),
  );
  return sortBusinesses(all);
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

export function breadcrumbJsonLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', href: '/' }, ...items].map((item, i) => ({
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
