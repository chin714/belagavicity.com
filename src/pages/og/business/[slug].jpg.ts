import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getArea, getCategory, listNames } from '../../../lib/site';
import { ogResponse, renderOgImage } from '../../../lib/og';

export async function getStaticPaths() {
  const businesses = await getCollection('businesses');
  return businesses.map((business) => ({ params: { slug: business.id }, props: { business } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { business } = props;
  const b = business.data;
  const category = await getCategory(b.category.id);
  const area = await getArea(b.area.id);

  const details = [
    b.verified && 'Verified',
    b.yearsInBusiness && `${b.yearsInBusiness}+ years in business`,
    b.languages.length > 0 && `Speaks ${listNames(b.languages)}`,
  ].filter(Boolean);

  return ogResponse(
    await renderOgImage({
      key: business.id,
      title: b.name,
      place: `${category.data.singular} in ${area.data.name}, Belagavi`,
      subtitle: details.length ? details.join(' · ') : 'Call or WhatsApp directly.',
      icon: category.data.icon,
    }),
  );
};
