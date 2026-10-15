import type { APIRoute } from 'astro';
import { getCategoryAreaPaths } from '../../../lib/site';
import { ogResponse, renderOgImage } from '../../../lib/og';

export const getStaticPaths = getCategoryAreaPaths;

export const GET: APIRoute = async ({ props }) => {
  const { category, area, businesses } = props;
  const c = category.data;

  return ogResponse(
    await renderOgImage({
      key: `${category.id}/${area.id}`,
      title: c.name,
      place: `in ${area.data.name}, Belagavi`,
      subtitle: `${businesses.length} listed in ${area.data.name}. Call or WhatsApp directly.`,
      icon: c.icon,
    }),
  );
};
