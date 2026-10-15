import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getBusinesses, getLiveCategories, servesArea } from '../../lib/site';
import { ogResponse, renderOgImage } from '../../lib/og';

export async function getStaticPaths() {
  const categories = await getLiveCategories();
  return categories.map((category) => ({ params: { category: category.id }, props: { category } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { category } = props;
  const c = category.data;
  const businesses = await getBusinesses({ category: category.id });
  const areas = (await getCollection('areas'))
    .filter((a) => businesses.some((b) => servesArea(b, a.id)))
    .map((a) => a.data.name);

  const where =
    areas.length > 3 ? `${areas.slice(0, 3).join(', ')} and ${areas.length - 3} more areas` : listNames(areas);
  const subtitle = businesses.length
    ? `${businesses.length} listed in ${where}. Call or WhatsApp directly.`
    : `Call or WhatsApp local ${c.name.toLowerCase()} directly.`;

  return ogResponse(
    await renderOgImage({ key: category.id, title: c.name, place: 'in Belagavi', subtitle, icon: c.icon }),
  );
};

function listNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0];
}
