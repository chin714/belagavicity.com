import type { APIRoute } from 'astro';
import { ogResponse, renderOgImage } from '../lib/og';

// Share image for every page that doesn't set its own.
export const GET: APIRoute = async () =>
  ogResponse(
    await renderOgImage({
      key: 'default',
      title: 'Find trusted local businesses',
      place: 'in Belagavi',
      subtitle: 'Electricians, dentists, tech help and more, all in one directory.',
    }),
  );
