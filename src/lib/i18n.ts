// English and Kannada. English pages live at the root ("/dentists/"), Kannada ones
// under /kn/ ("/kn/dentists/"). Pages are in src/pages/[...lang]/, so each one is
// built once per language from the same template.
import type { CollectionEntry } from 'astro:content';

export const LANGS = ['en', 'kn'] as const;
export type Lang = (typeof LANGS)[number];

/** BCP 47 tags for <html lang>, hreflang and the sitemap. */
export const LOCALES: Record<Lang, string> = { en: 'en-IN', kn: 'kn-IN' };

/** Reads the `[...lang]` route param: undefined is English. */
export function getLang(param: string | undefined): Lang {
  return param === 'kn' ? 'kn' : 'en';
}

/** Prefixes a site path for the language: "/dentists/" -> "/kn/dentists/". */
export function href(lang: Lang, path: string) {
  return lang === 'en' ? path : `/${lang}${path}`;
}

/** The current page's path in the other language. */
export function swapLang(pathname: string, to: Lang) {
  return href(to, pathname.replace(/^\/kn(?=\/|$)/, '') || '/');
}

type StaticPath = { params: Record<string, string | undefined>; props?: Record<string, unknown> };

/** Builds every getStaticPaths entry once per language, adding `lang` to the props. */
export function withLangs<P extends StaticPath>(paths: P[]) {
  return LANGS.flatMap((lang) =>
    paths.map((p) => ({
      params: { ...p.params, lang: lang === 'en' ? undefined : lang },
      props: { ...(p.props as P['props']), lang },
    })),
  );
}

// ---------- Content in the page's language (Kannada falls back to English) ----------

export function categoryText(c: CollectionEntry<'categories'>, lang: Lang) {
  const d = c.data;
  if (lang === 'en') {
    return { name: d.name, singular: d.singular, intro: d.intro, services: d.services, pricing: d.pricing, faqs: d.faqs };
  }
  const k = d.kn;
  return {
    name: k.name,
    singular: k.singular,
    intro: k.intro ?? d.intro,
    services: k.services ?? d.services,
    pricing: k.pricing ?? d.pricing,
    faqs: k.faqs ?? d.faqs,
  };
}
export type CategoryText = ReturnType<typeof categoryText>;

export function areaText(a: CollectionEntry<'areas'>, lang: Lang) {
  const d = a.data;
  if (lang === 'en') return { name: d.name, nameIn: `in ${d.name}`, description: d.description, landmarks: d.landmarks };
  const k = d.kn;
  return { name: k.name, nameIn: k.nameIn, description: k.description ?? d.description, landmarks: k.landmarks ?? d.landmarks };
}
export type AreaText = ReturnType<typeof areaText>;

export function businessText(b: CollectionEntry<'businesses'>, lang: Lang) {
  const d = b.data;
  if (lang === 'en') return { description: d.description, services: d.services, hours: d.hours, photos: d.photos };
  return {
    description: d.kn.description ?? d.description,
    services: d.kn.services ?? d.services,
    hours: d.kn.hours ?? d.hours,
    photos: d.photos.map((p, i) => ({ ...p, alt: d.kn.photoAlts?.[i] ?? p.alt })),
  };
}

// ---------- Interface text ----------

const en = {
  tagline: 'Local businesses in Belagavi (Belgaum)',
  belagavi: 'Belagavi',
  and: 'and',
  home: 'Home',
  exploreBusinesses: 'Explore businesses',
  areas: 'Areas',
  listYourBusiness: 'List your business',
  listFree: 'List your business for free',
  addYourBusiness: 'Add your business',
  menu: 'Menu',
  services: 'Services',
  browseByArea: 'Browse by area',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
  /** The link to the other language, written in that language. */
  otherLang: 'ಕನ್ನಡ',
  otherLangTitle: 'ಈ ಪುಟವನ್ನು ಕನ್ನಡದಲ್ಲಿ ನೋಡಿ',
  footerServing: 'Serving every corner of Belagavi (formerly Belgaum), Karnataka',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  terms: 'Terms',
  lastUpdated: 'Last updated:',
  published: 'Published:',

  // Listings
  verified: 'Verified',
  featured: 'Featured',
  sample: 'Sample',
  sampleListing: 'Sample listing',
  call: 'Call',
  whatsapp: 'WhatsApp',
  yrsInBusiness: (n: number) => `${n} yrs in business`,
  yearsInBusiness: (n: number) => `${n} years in business`,
  languageNames: { Kannada: 'Kannada', Marathi: 'Marathi', Hindi: 'Hindi', English: 'English' } as Record<string, string>,
  inBelagavi: (name: string) => `${name} in Belagavi`,
  inArea: (name: string, area: AreaText) => `${name} in ${area.name}`,

  // Home
  homeDescription:
    'Find trusted electricians, dentists and other local services in Belagavi (Belgaum), Karnataka. Browse by area, then call or WhatsApp directly.',
  heroEyebrow: 'Belagavi, Karnataka',
  heroEyebrowAlt: 'ಬೆಳಗಾವಿ',
  heroTitle: 'Find who you need in Belagavi.',
  heroText: 'Local services in every area, from Camp to Vadgaon. Call or WhatsApp them directly: no middleman, no booking fee.',
  whatLabel: 'What are you looking for',
  areaLabel: 'Area',
  allAreas: 'All areas of Belagavi',
  search: 'Search',
  popular: 'Popular:',
  browseByCategory: 'Browse by category',
  newCategories: 'New categories are added every week.',
  browseListings: 'Browse listings',
  comingSoon: 'Coming soon',
  featuredInBelagavi: 'Featured in Belagavi',
  callToday: 'Local businesses you can call today.',
  seeAll: 'See all',
  ctaTitle: 'Run a business in Belagavi?',
  ctaText: 'Get found by customers in your area. Basic listings are free.',
  photos: 'Photos:',
  photoCredit: (place: string, author: string) => [place, ` by ${author}, `],
  cropped: 'Cropped and resized.',
  slideAlts: {
    soudha: 'Suvarna Vidhana Soudha, Belagavi',
    kamalBasadi: 'Kamal Basadi, Belagavi',
    chennamma: 'Chennamma Circle, Belagavi',
  },

  // Category pages
  categoryTitle: (name: string) => `${name} in Belagavi (Belgaum): Call or WhatsApp`,
  categoryDescription: (name: string, where: string) =>
    `${name} in Belagavi (Belgaum)${where ? `, listed by area: ${where}` : ''}. See typical prices and services, then call or WhatsApp directly.`,
  andMore: (names: string[]) => `${names.join(', ')} and more`,
  listedCovered: (n: number, areas: number) => `${n} listed · ${areas} areas covered`,
  servingAll: 'Serving all of Belagavi (Belgaum), from Camp to Vadgaon.',
  byArea: 'By area',
  allInBelagavi: (c: CategoryText) => `All ${c.name.toLowerCase()} in Belagavi`,
  typicalPrices: 'Typical prices in Belagavi',
  pricesNote: 'Indicative labour charges. Materials are extra. Always confirm the price before work starts.',
  commonJobs: 'Common jobs',
  faqs: 'Frequently asked questions',
  noneInArea: (c: CategoryText, area: AreaText) =>
    `No ${c.name.toLowerCase()} are listed in ${area.name} yet. Here are ${c.name.toLowerCase()} from across Belagavi.`,

  // Category + area pages
  categoryAreaTitle: (c: CategoryText, area: AreaText) => `${c.name} in ${area.name}, Belagavi (Belgaum)`,
  categoryAreaDescription: (c: CategoryText, area: AreaText, count: string) =>
    `${c.name} in ${area.name}, Belagavi (Belgaum): ${count} listed. See services and languages spoken, then call or WhatsApp directly.`,
  areaIntroCount: (count: string, area: AreaText, landmarks: string) =>
    `${count} listed in ${area.name}${landmarks ? `, near ${landmarks}` : ''}.`,
  areaIntroNearby: (area: AreaText, nearby: string) => `${area.name} is close to ${nearby}.`,
  areaIntroServices: (services: string) => `Services commonly offered in Belagavi (Belgaum) include ${services}.`,
  areaIntroCall: 'Call or WhatsApp to confirm timings and charges.',
  alsoSee: 'Also see:',
  nearbyInBelagavi: 'Nearby in Belagavi',
  seeAllIn: (c: CategoryText) => `See all ${c.name.toLowerCase()} in Belagavi →`,

  // Areas
  areasTitle: 'Areas of Belagavi (Belgaum): Local Services by Locality',
  areasDescription:
    'Browse local businesses and services in every area of Belagavi (Belgaum): Tilakwadi, Camp, Shahapur, Vadgaon, Udyambag and more.',
  areasHeading: 'Areas of Belagavi',
  areasLede: 'Pick your locality to see services near you.',
  listingsCount: (n: number) => `${n} listings →`,
  listingsSoon: 'Listings coming soon',
  areaTitle: (area: AreaText, other: string) => `Local Services in ${area.name} (${other}), Belagavi`,
  areaDescription: (area: AreaText) => `Local services in ${area.name}, Belagavi (Belgaum). ${area.description}`,
  noneYet: (area: AreaText) => `No businesses are listed in ${area.name} yet.`,
  beFirst: "Run a business here? Be the first to get listed. It's free.",
  viewAll: 'View all →',
  helplinesHeading: (area: AreaText) => `Power and water helplines ${area.nameIn}`,
  helplinesPower: 'Electricity (HESCOM)',
  helplinesWater: 'Water supply',
  helplinesSubdivision: (name: string) => `HESCOM ${name}, Assistant Executive Engineer`,
  helplinesChecked: (date: string) => `Numbers taken from official sources and checked on ${date}. In an emergency, call 112.`,

  // Business pages
  businessTitles: (name: string, singular: string, area: AreaText) => [
    `${name}, ${singular} in ${area.name}, Belagavi`,
    `${name}, ${singular}, Belagavi`,
    `${name}, Belagavi`,
  ],
  /** `singular` arrives lowercased (keeping acronyms), for mid-sentence use. */
  businessIntro: (name: string, singular: string, area: AreaText) => `${name}, ${singular} in ${area.name}, Belagavi (Belgaum).`,
  businessOutro: ' Call or WhatsApp directly.',
  sampleNotice: 'This is placeholder data used while the site is being built. It is not a real business.',
  callNumber: (phone: string) => `Call ${phone}`,
  messageWhatsApp: 'Message on WhatsApp',
  address: 'Address',
  alsoServes: 'Also serves',
  alsoListedIn: 'Also listed in',
  hours: 'Hours',
  languages: 'Languages',
  openMaps: 'Open in Google Maps',
  mentionUs: 'Mention belagavicity.com when you call. Is this information wrong?',
  tellUs: 'Tell us',
  otherInArea: (c: CategoryText, area: AreaText) => `Other ${c.name.toLowerCase()} in ${area.name}`,

  // List your business
  listTitle: 'List Your Business for Free',
  listDescription: 'Add your Belagavi (Belgaum) business to belagavicity.com for free and get calls from customers in your area.',
  listLede:
    "Customers in Belagavi search here for local services. Send us your details and we'll add your listing, usually within 2 working days.",
  businessName: 'Business name',
  category: 'Category',
  other: 'Other',
  phoneWhatsApp: 'Phone / WhatsApp',
  servicesYouOffer: 'Services you offer',
  sendDetails: 'Send my details',
  whatYouGet: 'What you get',
  perks: [
    'Your own page with call and WhatsApp buttons',
    'Shown on your area and service pages',
    'Customers contact you directly; we take no commission',
    'Free basic listing',
  ],
  featuredNote: 'Want a featured spot at the top of your category? Ask us about featured listings.',
};

type UI = typeof en;

const kn: UI = {
  tagline: 'ಬೆಳಗಾವಿಯ (ಬೆಳಗಾಂ) ಸ್ಥಳೀಯ ವ್ಯವಹಾರಗಳು',
  belagavi: 'ಬೆಳಗಾವಿ',
  and: 'ಮತ್ತು',
  home: 'ಮುಖಪುಟ',
  exploreBusinesses: 'ವ್ಯವಹಾರಗಳನ್ನು ಹುಡುಕಿ',
  areas: 'ಪ್ರದೇಶಗಳು',
  listYourBusiness: 'ನಿಮ್ಮ ವ್ಯವಹಾರ ಸೇರಿಸಿ',
  listFree: 'ನಿಮ್ಮ ವ್ಯವಹಾರವನ್ನು ಉಚಿತವಾಗಿ ಸೇರಿಸಿ',
  addYourBusiness: 'ವ್ಯವಹಾರ ಸೇರಿಸಿ',
  menu: 'ಮೆನು',
  services: 'ಸೇವೆಗಳು',
  browseByArea: 'ಪ್ರದೇಶವಾರು ನೋಡಿ',
  toDark: 'ಡಾರ್ಕ್ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ',
  toLight: 'ಲೈಟ್ ಮೋಡ್‌ಗೆ ಬದಲಿಸಿ',
  otherLang: 'English',
  otherLangTitle: 'View this page in English',
  footerServing: 'ಕರ್ನಾಟಕದ ಬೆಳಗಾವಿಯ (ಹಿಂದಿನ ಬೆಳಗಾಂ) ಎಲ್ಲ ಭಾಗಗಳಿಗೂ ಸೇವೆ',
  about: 'ನಮ್ಮ ಬಗ್ಗೆ',
  contact: 'ಸಂಪರ್ಕಿಸಿ',
  privacy: 'ಗೌಪ್ಯತೆ',
  terms: 'ನಿಯಮಗಳು',
  lastUpdated: 'ಕೊನೆಯ ಪರಿಷ್ಕರಣೆ:',
  published: 'ಪ್ರಕಟಣೆ:',

  verified: 'ಪರಿಶೀಲಿತ',
  featured: 'ವಿಶೇಷ',
  sample: 'ಮಾದರಿ',
  sampleListing: 'ಮಾದರಿ ಪಟ್ಟಿ',
  call: 'ಕರೆ ಮಾಡಿ',
  whatsapp: 'ವಾಟ್ಸಾಪ್',
  yrsInBusiness: (n) => `${n} ವರ್ಷಗಳ ಅನುಭವ`,
  yearsInBusiness: (n) => `${n} ವರ್ಷಗಳ ಅನುಭವ`,
  languageNames: { Kannada: 'ಕನ್ನಡ', Marathi: 'ಮರಾಠಿ', Hindi: 'ಹಿಂದಿ', English: 'ಇಂಗ್ಲಿಷ್' },
  inBelagavi: (name) => `ಬೆಳಗಾವಿಯಲ್ಲಿ ${name}`,
  inArea: (name, area) => `${area.nameIn} ${name}`,

  homeDescription:
    'ಕರ್ನಾಟಕದ ಬೆಳಗಾವಿಯಲ್ಲಿ (ಬೆಳಗಾಂ) ನಂಬಿಕಸ್ಥ ಎಲೆಕ್ಟ್ರಿಷಿಯನ್‌ಗಳು, ದಂತವೈದ್ಯರು ಮತ್ತು ಇತರ ಸ್ಥಳೀಯ ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ. ಪ್ರದೇಶವಾರು ನೋಡಿ, ನಂತರ ನೇರವಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.',
  heroEyebrow: 'ಬೆಳಗಾವಿ, ಕರ್ನಾಟಕ',
  heroEyebrowAlt: 'Belgaum',
  heroTitle: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ನಿಮಗೆ ಬೇಕಾದವರನ್ನು ಹುಡುಕಿ.',
  heroText: 'ಕ್ಯಾಂಪ್‌ನಿಂದ ವಡಗಾಂವಿನವರೆಗೆ ಪ್ರತಿ ಪ್ರದೇಶದ ಸ್ಥಳೀಯ ಸೇವೆಗಳು. ನೇರವಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ: ಮಧ್ಯವರ್ತಿ ಇಲ್ಲ, ಬುಕಿಂಗ್ ಶುಲ್ಕ ಇಲ್ಲ.',
  whatLabel: 'ನೀವು ಏನನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ',
  areaLabel: 'ಪ್ರದೇಶ',
  allAreas: 'ಬೆಳಗಾವಿಯ ಎಲ್ಲ ಪ್ರದೇಶಗಳು',
  search: 'ಹುಡುಕಿ',
  popular: 'ಜನಪ್ರಿಯ:',
  browseByCategory: 'ವರ್ಗವಾರು ನೋಡಿ',
  newCategories: 'ಪ್ರತಿ ವಾರ ಹೊಸ ವರ್ಗಗಳನ್ನು ಸೇರಿಸಲಾಗುತ್ತಿದೆ.',
  browseListings: 'ಪಟ್ಟಿ ನೋಡಿ',
  comingSoon: 'ಶೀಘ್ರದಲ್ಲೇ',
  featuredInBelagavi: 'ಬೆಳಗಾವಿಯ ಆಯ್ದ ವ್ಯವಹಾರಗಳು',
  callToday: 'ಇಂದೇ ಕರೆ ಮಾಡಬಹುದಾದ ಸ್ಥಳೀಯ ವ್ಯವಹಾರಗಳು.',
  seeAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
  ctaTitle: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ವ್ಯವಹಾರ ನಡೆಸುತ್ತಿದ್ದೀರಾ?',
  ctaText: 'ನಿಮ್ಮ ಪ್ರದೇಶದ ಗ್ರಾಹಕರು ನಿಮ್ಮನ್ನು ಸುಲಭವಾಗಿ ಹುಡುಕುವಂತೆ ಮಾಡಿ. ಮೂಲ ಪಟ್ಟಿ ಉಚಿತ.',
  photos: 'ಚಿತ್ರಗಳು:',
  photoCredit: (place, author) => [place, `, ಚಿತ್ರ: ${author}, `],
  cropped: 'ಕತ್ತರಿಸಿ ಗಾತ್ರ ಬದಲಿಸಲಾಗಿದೆ.',
  slideAlts: {
    soudha: 'ಸುವರ್ಣ ವಿಧಾನಸೌಧ, ಬೆಳಗಾವಿ',
    kamalBasadi: 'ಕಮಲ ಬಸದಿ, ಬೆಳಗಾವಿ',
    chennamma: 'ಚನ್ನಮ್ಮ ವೃತ್ತ, ಬೆಳಗಾವಿ',
  },

  categoryTitle: (name) => `ಬೆಳಗಾವಿಯಲ್ಲಿ (ಬೆಳಗಾಂ) ${name}: ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ`,
  categoryDescription: (name, where) =>
    `ಬೆಳಗಾವಿಯಲ್ಲಿ (ಬೆಳಗಾಂ) ${name}${where ? `, ಪ್ರದೇಶವಾರು: ${where}` : ''}. ಸಾಮಾನ್ಯ ದರಗಳು ಮತ್ತು ಸೇವೆಗಳನ್ನು ನೋಡಿ, ನಂತರ ನೇರವಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.`,
  andMore: (names) => `${names.join(', ')} ಮತ್ತು ಇತರೆ`,
  listedCovered: (n, areas) => `${n} ಪಟ್ಟಿಗಳು · ${areas} ಪ್ರದೇಶಗಳು`,
  servingAll: 'ಕ್ಯಾಂಪ್‌ನಿಂದ ವಡಗಾಂವಿನವರೆಗೆ ಇಡೀ ಬೆಳಗಾವಿಗೆ ಸೇವೆ.',
  byArea: 'ಪ್ರದೇಶವಾರು',
  allInBelagavi: (c) => `ಬೆಳಗಾವಿಯ ಎಲ್ಲ ${c.name}`,
  typicalPrices: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ಸಾಮಾನ್ಯ ದರಗಳು',
  pricesNote: 'ಅಂದಾಜು ಕೂಲಿ ದರಗಳು. ಸಾಮಗ್ರಿಗಳ ವೆಚ್ಚ ಪ್ರತ್ಯೇಕ. ಕೆಲಸ ಆರಂಭಿಸುವ ಮೊದಲು ದರವನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
  commonJobs: 'ಸಾಮಾನ್ಯ ಕೆಲಸಗಳು',
  faqs: 'ಪದೇ ಪದೇ ಕೇಳುವ ಪ್ರಶ್ನೆಗಳು',
  noneInArea: (c, area) => `${area.nameIn} ಇನ್ನೂ ಯಾವುದೇ ${c.name} ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲ. ಬೆಳಗಾವಿಯಾದ್ಯಂತದ ${c.name} ಪಟ್ಟಿ ಕೆಳಗಿದೆ.`,

  categoryAreaTitle: (c, area) => `${area.nameIn} ${c.name}, ಬೆಳಗಾವಿ (ಬೆಳಗಾಂ)`,
  categoryAreaDescription: (c, area, count) =>
    `${area.nameIn} (ಬೆಳಗಾವಿ) ${count} ಲಭ್ಯ. ಸೇವೆಗಳು ಮತ್ತು ಮಾತನಾಡುವ ಭಾಷೆಗಳನ್ನು ನೋಡಿ, ನಂತರ ನೇರವಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.`,
  areaIntroCount: (count, area, landmarks) => `${area.nameIn}${landmarks ? ` (ಹತ್ತಿರ: ${landmarks})` : ''} ${count} ಲಭ್ಯ.`,
  areaIntroNearby: (_area, nearby) => `ಹತ್ತಿರದ ಪ್ರದೇಶಗಳು: ${nearby}.`,
  areaIntroServices: (services) => `ಬೆಳಗಾವಿಯಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿ ದೊರೆಯುವ ಸೇವೆಗಳು: ${services}.`,
  areaIntroCall: 'ಸಮಯ ಮತ್ತು ದರಗಳನ್ನು ಖಚಿತಪಡಿಸಲು ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.',
  alsoSee: 'ಇವನ್ನೂ ನೋಡಿ:',
  nearbyInBelagavi: 'ಬೆಳಗಾವಿಯಲ್ಲಿ ಹತ್ತಿರದ ಇತರರು',
  seeAllIn: (c) => `ಬೆಳಗಾವಿಯ ಎಲ್ಲ ${c.name} ನೋಡಿ →`,

  areasTitle: 'ಬೆಳಗಾವಿಯ (ಬೆಳಗಾಂ) ಪ್ರದೇಶಗಳು: ಪ್ರದೇಶವಾರು ಸ್ಥಳೀಯ ಸೇವೆಗಳು',
  areasDescription:
    'ಬೆಳಗಾವಿಯ (ಬೆಳಗಾಂ) ಪ್ರತಿ ಪ್ರದೇಶದ ಸ್ಥಳೀಯ ವ್ಯವಹಾರಗಳು ಮತ್ತು ಸೇವೆಗಳು: ತಿಲಕವಾಡಿ, ಕ್ಯಾಂಪ್, ಶಹಾಪುರ, ವಡಗಾಂವ, ಉದ್ಯಮಬಾಗ ಮತ್ತು ಇನ್ನಷ್ಟು.',
  areasHeading: 'ಬೆಳಗಾವಿಯ ಪ್ರದೇಶಗಳು',
  areasLede: 'ನಿಮ್ಮ ಹತ್ತಿರದ ಸೇವೆಗಳನ್ನು ನೋಡಲು ನಿಮ್ಮ ಪ್ರದೇಶವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
  listingsCount: (n) => `${n} ಪಟ್ಟಿಗಳು →`,
  listingsSoon: 'ಪಟ್ಟಿಗಳು ಶೀಘ್ರದಲ್ಲೇ',
  areaTitle: (area, other) => `${area.name} (${other}), ಬೆಳಗಾವಿ: ಸ್ಥಳೀಯ ಸೇವೆಗಳು`,
  areaDescription: (area) => `${area.nameIn} (ಬೆಳಗಾವಿ) ಸ್ಥಳೀಯ ಸೇವೆಗಳು. ${area.description}`,
  noneYet: (area) => `${area.nameIn} ಇನ್ನೂ ಯಾವುದೇ ವ್ಯವಹಾರ ಪಟ್ಟಿಯಲ್ಲಿಲ್ಲ.`,
  beFirst: 'ಇಲ್ಲಿ ವ್ಯವಹಾರ ನಡೆಸುತ್ತೀರಾ? ಮೊದಲಿಗರಾಗಿ ಪಟ್ಟಿಗೆ ಸೇರಿ. ಇದು ಉಚಿತ.',
  viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ →',
  helplinesHeading: (area) => `${area.nameIn} ವಿದ್ಯುತ್ ಮತ್ತು ನೀರು ಸಹಾಯವಾಣಿಗಳು`,
  helplinesPower: 'ವಿದ್ಯುತ್ (ಹೆಸ್ಕಾಂ)',
  helplinesWater: 'ನೀರು ಸರಬರಾಜು',
  helplinesSubdivision: (name) => `ಹೆಸ್ಕಾಂ ${name}, ಸಹಾಯಕ ಕಾರ್ಯನಿರ್ವಾಹಕ ಎಂಜಿನಿಯರ್`,
  helplinesChecked: (date) => `ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ಪಡೆದ ಸಂಖ್ಯೆಗಳು, ${date} ರಂದು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 112 ಗೆ ಕರೆ ಮಾಡಿ.`,

  businessTitles: (name, singular, area) => [
    `${name}, ${area.nameIn} ${singular}, ಬೆಳಗಾವಿ`,
    `${name}, ${singular}, ಬೆಳಗಾವಿ`,
    `${name}, ಬೆಳಗಾವಿ`,
  ],
  businessIntro: (name, singular, area) => `${name}, ${area.nameIn} ${singular}, ಬೆಳಗಾವಿ (ಬೆಳಗಾಂ).`,
  businessOutro: ' ನೇರವಾಗಿ ಕರೆ ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮಾಡಿ.',
  sampleNotice: 'ಇದು ಸೈಟ್ ನಿರ್ಮಾಣದ ಸಮಯದಲ್ಲಿ ಬಳಸಿದ ತಾತ್ಕಾಲಿಕ ಮಾಹಿತಿ. ಇದು ನಿಜವಾದ ವ್ಯವಹಾರವಲ್ಲ.',
  callNumber: (phone) => `ಕರೆ ಮಾಡಿ ${phone}`,
  messageWhatsApp: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಸಂದೇಶ ಕಳುಹಿಸಿ',
  address: 'ವಿಳಾಸ',
  alsoServes: 'ಇಲ್ಲಿಯೂ ಸೇವೆ',
  alsoListedIn: 'ಇತರ ವರ್ಗಗಳು',
  hours: 'ಸಮಯ',
  languages: 'ಭಾಷೆಗಳು',
  openMaps: 'Google Maps‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
  mentionUs: 'ಕರೆ ಮಾಡುವಾಗ belagavicity.com ಹೆಸರು ಹೇಳಿ. ಈ ಮಾಹಿತಿ ತಪ್ಪಾಗಿದೆಯೇ?',
  tellUs: 'ನಮಗೆ ತಿಳಿಸಿ',
  otherInArea: (c, area) => `${area.nameIn} ಇತರ ${c.name}`,

  listTitle: 'ನಿಮ್ಮ ವ್ಯವಹಾರವನ್ನು ಉಚಿತವಾಗಿ ಸೇರಿಸಿ',
  listDescription: 'ನಿಮ್ಮ ಬೆಳಗಾವಿಯ (ಬೆಳಗಾಂ) ವ್ಯವಹಾರವನ್ನು belagavicity.com ಗೆ ಉಚಿತವಾಗಿ ಸೇರಿಸಿ ಮತ್ತು ನಿಮ್ಮ ಪ್ರದೇಶದ ಗ್ರಾಹಕರಿಂದ ಕರೆಗಳನ್ನು ಪಡೆಯಿರಿ.',
  listLede:
    'ಬೆಳಗಾವಿಯ ಗ್ರಾಹಕರು ಸ್ಥಳೀಯ ಸೇವೆಗಳಿಗಾಗಿ ಇಲ್ಲಿ ಹುಡುಕುತ್ತಾರೆ. ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ; ಸಾಮಾನ್ಯವಾಗಿ 2 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಪಟ್ಟಿಯನ್ನು ಸೇರಿಸುತ್ತೇವೆ.',
  businessName: 'ವ್ಯವಹಾರದ ಹೆಸರು',
  category: 'ವರ್ಗ',
  other: 'ಇತರೆ',
  phoneWhatsApp: 'ಫೋನ್ / ವಾಟ್ಸಾಪ್',
  servicesYouOffer: 'ನೀವು ನೀಡುವ ಸೇವೆಗಳು',
  sendDetails: 'ನನ್ನ ವಿವರಗಳನ್ನು ಕಳುಹಿಸಿ',
  whatYouGet: 'ನಿಮಗೆ ಏನು ಸಿಗುತ್ತದೆ',
  perks: [
    'ಕರೆ ಮತ್ತು ವಾಟ್ಸಾಪ್ ಬಟನ್‌ಗಳಿರುವ ನಿಮ್ಮದೇ ಪುಟ',
    'ನಿಮ್ಮ ಪ್ರದೇಶ ಮತ್ತು ಸೇವೆಯ ಪುಟಗಳಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ',
    'ಗ್ರಾಹಕರು ನೇರವಾಗಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ; ನಾವು ಯಾವುದೇ ಕಮಿಷನ್ ಪಡೆಯುವುದಿಲ್ಲ',
    'ಉಚಿತ ಮೂಲ ಪಟ್ಟಿ',
  ],
  featuredNote: 'ನಿಮ್ಮ ವರ್ಗದ ಮೇಲ್ಭಾಗದಲ್ಲಿ ವಿಶೇಷ ಸ್ಥಾನ ಬೇಕೇ? ವಿಶೇಷ ಪಟ್ಟಿಗಳ ಬಗ್ಗೆ ನಮ್ಮನ್ನು ಕೇಳಿ.',
};

export const UI_TEXT: Record<Lang, UI> = { en, kn };

/** Interface text for a language. */
export function ui(lang: Lang) {
  return UI_TEXT[lang];
}
