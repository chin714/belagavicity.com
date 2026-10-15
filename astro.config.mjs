// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://belagavicity.com';

// Pages marked noindex (sample listings, and area pages with no real listings)
// are kept out of the sitemap too. Mirrors the `noindex` logic in src/pages.
function noindexPaths() {
  const dir = './src/data/businesses';
  const businesses = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ id: path.basename(f, '.json'), ...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
  const areas = JSON.parse(fs.readFileSync('./src/data/areas.json', 'utf8'));

  const hasReal = (pred) => businesses.some((b) => !b.sample && pred(b));
  const paths = new Set(businesses.filter((b) => b.sample).map((b) => `/business/${b.id}/`));
  for (const b of businesses) {
    if (!hasReal((r) => r.category === b.category && r.area === b.area)) paths.add(`/${b.category}/${b.area}/`);
  }
  for (const a of areas) {
    if (!hasReal((r) => r.area === a.id)) paths.add(`/areas/${a.id}/`);
  }
  // Kannada copies of the same pages, under /kn/.
  for (const p of [...paths]) paths.add(`/kn${p}`);
  return paths;
}

const excluded = noindexPaths();

// https://astro.build/config
export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (page) => !excluded.has(new URL(page).pathname),
      // Lists each page's English and Kannada versions as alternates of each other.
      i18n: { defaultLocale: 'en', locales: { en: 'en-IN', kn: 'kn-IN' } },
    }),
  ],
});
