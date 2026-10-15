import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Localities of Belagavi. Area pages and "service in area" pages are built from these.
const areas = defineCollection({
  loader: file('src/data/areas.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    // Adjacent localities. Category+area pages link to the same category in these areas.
    nearby: z.array(reference('areas')).default([]),
    // Well-known places in the area, e.g. "Gogte Circle". Mentioned on category+area pages.
    landmarks: z.array(z.string()).default([]),
    // Kannada text for the /kn/ pages. `nameIn` is the name with "in" attached ("ತಿಲಕವಾಡಿಯಲ್ಲಿ"),
    // since the suffix depends on how the name ends.
    kn: z.object({
      name: z.string(),
      nameIn: z.string(),
      description: z.string().optional(),
      landmarks: z.array(z.string()).optional(),
    }),
  }),
});

// Service categories. Only `live` categories get pages; the rest show as "coming soon".
const categories = defineCollection({
  loader: file('src/data/categories.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(), // plural, used in headings: "Electricians"
    singular: z.string(), // "Electrician"
    icon: z.string(),
    group: z.enum(['home', 'health', 'professional', 'events', 'tech', 'local']),
    live: z.boolean().default(false),
    schemaType: z.string().default('LocalBusiness'), // schema.org type, e.g. Electrician
    intro: z.string().optional(),
    services: z.array(z.string()).default([]),
    pricing: z
      .array(z.object({ job: z.string(), range: z.string() }))
      .default([]),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    // Kannada text for the /kn/ pages. Missing fields fall back to English.
    kn: z.object({
      name: z.string(),
      singular: z.string(),
      intro: z.string().optional(),
      services: z.array(z.string()).optional(),
      pricing: z.array(z.object({ job: z.string(), range: z.string() })).optional(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    }),
  }),
});

// One JSON file per business in src/data/businesses/. The file name becomes the URL slug.
const businesses = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/businesses' }),
  schema: z.object({
    name: z.string(),
    category: reference('categories'),
    area: reference('areas'),
    // Adjacent localities the business also covers. It is listed on those area pages too.
    alsoServes: z.array(reference('areas')).default([]),
    // Other categories the business also works in. It is listed on those category pages too.
    alsoListedIn: z.array(reference('categories')).default([]),
    phone: z.string(),
    whatsapp: z.string().optional(),
    address: z.string(),
    hours: z.string().optional(),
    mapUrl: z.url().optional(),
    description: z.string(),
    services: z.array(z.string()).default([]),
    languages: z.array(z.enum(['Kannada', 'Marathi', 'Hindi', 'English'])).default([]),
    yearsInBusiness: z.number().int().optional(),
    verified: z.boolean().default(false),
    featured: z.boolean().default(false),
    // Placeholder data for development. Sample listings are labelled on the page,
    // kept out of the sitemap and marked noindex. Delete them before launch.
    sample: z.boolean().default(false),
    // Kannada text for the /kn/ pages. Missing fields fall back to English.
    kn: z
      .object({
        description: z.string().optional(),
        services: z.array(z.string()).optional(),
        hours: z.string().optional(),
      })
      .default({}),
  }),
});

export const collections = { areas, categories, businesses };
