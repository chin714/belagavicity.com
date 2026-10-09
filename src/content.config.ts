import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Localities of Belagavi. Area pages and "service in area" pages are built from these.
const areas = defineCollection({
  loader: file('src/data/areas.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    nameKn: z.string().optional(),
    description: z.string(),
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
    group: z.enum(['home', 'health', 'professional', 'events', 'local']),
    live: z.boolean().default(false),
    schemaType: z.string().default('LocalBusiness'), // schema.org type, e.g. Electrician
    intro: z.string().optional(),
    services: z.array(z.string()).default([]),
    pricing: z
      .array(z.object({ job: z.string(), range: z.string() }))
      .default([]),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

// One JSON file per business in src/data/businesses/. The file name becomes the URL slug.
const businesses = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/data/businesses' }),
  schema: z.object({
    name: z.string(),
    category: reference('categories'),
    area: reference('areas'),
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
  }),
});

export const collections = { areas, categories, businesses };
