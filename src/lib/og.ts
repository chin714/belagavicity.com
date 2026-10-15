// Social share images (Open Graph), rendered at build time with satori + sharp.
// Endpoints in src/pages/og/ call renderOgImage() for every page that needs one,
// so new categories and areas get an image automatically.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { ICON_PATHS } from './icons';
import { SITE } from './site';

const WIDTH = 1200;
const HEIGHT = 630;
const PHOTO_WIDTH = 600;

const INK = '#12181b';
const BRAND = '#e8531f';

// Belagavi landmarks behind the text. Each page picks one by its id, so the same
// page always gets the same photo. These are CC BY-SA: the credit is printed on
// the image and must stay. Add more photos here to get more variety.
// `crop` (optional, in source pixels) is applied before resizing to the photo panel.
const PHOTOS: {
  file: string;
  place: string;
  credit: string;
  crop?: { left: number; top: number; width: number; height: number };
}[] = [
  {
    file: 'src/assets/hero/chennamma-circle.jpg',
    place: 'Chennamma Circle',
    credit: 'Djsourabh.bwd, CC BY-SA 4.0',
    // Statue only: cut just below the hooves to drop the pedestal and lights.
    crop: { left: 710, top: 58, width: 1983, height: 2083 },
  },
  {
    file: 'src/assets/hero/suvarna-vidhana-soudha.jpg',
    place: 'Suvarna Vidhana Soudha',
    credit: 'Riteshpg13, CC BY-SA 4.0',
  },
  {
    file: 'src/assets/hero/kamal-basadi.jpg',
    place: 'Kamal Basadi',
    credit: 'Nagaraj Sinhasan, CC BY-SA 4.0',
  },
];

export interface OgImage {
  /** Used to pick the background photo. */
  key: string;
  /** Large first line, e.g. "Dentists". */
  title: string;
  /** Orange second line, e.g. "in Belagavi". */
  place: string;
  /** One or two lines of detail under the title. */
  subtitle: string;
  /** Name from ICON_PATHS. Omitted on the default image. */
  icon?: string;
}

const file = (path: string) => readFile(resolve(path));
const dataUri = (mime: string, data: Buffer | string) =>
  `data:${mime};base64,${Buffer.from(data).toString('base64')}`;

// Loaded once per build and shared by every image.
let assets: ReturnType<typeof loadAssets> | undefined;

async function loadAssets() {
  const font = (pkg: string, name: string) => file(`node_modules/@fontsource/${pkg}/files/${name}`);
  const [fonts, logo, photos] = await Promise.all([
    Promise.all([
      font('bricolage-grotesque', 'bricolage-grotesque-latin-800-normal.woff'),
      font('ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff'),
      font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'),
    ]),
    file('src/assets/brand/logo-white.svg'),
    Promise.all(
      PHOTOS.map(async (p) => {
        const image = sharp(await file(p.file));
        if (p.crop) image.extract(p.crop);
        const jpg = await image
          .resize(PHOTO_WIDTH, HEIGHT, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toBuffer();
        return { ...p, src: dataUri('image/jpeg', jpg) };
      }),
    ),
  ]);
  return {
    fonts: [
      { name: 'Bricolage Grotesque', data: fonts[0], weight: 800 as const },
      { name: 'IBM Plex Sans', data: fonts[1], weight: 500 as const },
      { name: 'IBM Plex Sans', data: fonts[2], weight: 600 as const },
    ],
    logo: dataUri('image/svg+xml', logo),
    photos,
  };
}

function pickPhoto<T>(photos: T[], key: string) {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return photos[hash % photos.length];
}

function iconSvg(name: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name] ?? ICON_PATHS.store}</svg>`;
  return dataUri('image/svg+xml', svg);
}

// Minimal element builder for satori, so this file doesn't need JSX.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style, children },
});
const img = (src: string, style: Record<string, unknown>): Node => ({ type: 'img', props: { src, style } });

/** Shrinks long category names so they stay on two lines at most. */
function titleSize(title: string) {
  if (title.length <= 12) return 88;
  if (title.length <= 18) return 72;
  return 60;
}

/** "in Belagavi" stays large; "in Sadashiv Nagar, Belagavi" shrinks to fit one line. */
function placeSize(place: string) {
  return place.length <= 16 ? 52 : 40;
}

export async function renderOgImage(page: OgImage) {
  const { fonts, logo, photos } = await (assets ??= loadAssets());
  const photo = pickPhoto(photos, page.key);

  const tree = h(
    'div',
    { display: 'flex', width: WIDTH, height: HEIGHT, backgroundColor: INK, position: 'relative' },
    img(photo.src, { position: 'absolute', top: 0, right: 0, width: PHOTO_WIDTH, height: HEIGHT }),
    h('div', {
      position: 'absolute',
      top: 0,
      right: 0,
      width: PHOTO_WIDTH,
      height: HEIGHT,
      backgroundImage: `linear-gradient(90deg, ${INK} 0%, rgba(18,24,27,0.8) 25%, rgba(18,24,27,0) 60%)`,
    }),
    // Landmark name and photo credit, bottom right.
    h(
      'div',
      {
        position: 'absolute',
        right: 28,
        bottom: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        fontFamily: 'IBM Plex Sans',
        color: '#fff',
        textShadow: '0 1px 6px rgba(0,0,0,0.8)',
      },
      h(
        'div',
        { display: 'flex', alignItems: 'center', fontSize: 20, fontWeight: 600 },
        img(iconSvg('pin', '#fff'), { width: 20, height: 20, marginRight: 6 }),
        `${photo.place}, Belagavi`,
      ),
      h('div', { fontSize: 13, fontWeight: 500, opacity: 0.8, marginTop: 2 }, `Photo: ${photo.credit}`),
    ),
    h(
      'div',
      {
        position: 'absolute',
        left: 72,
        top: 60,
        bottom: 52,
        width: 640,
        display: 'flex',
        flexDirection: 'column',
      },
      img(logo, { width: 239, height: 56 }),
      h(
        'div',
        // Fills the space between logo and domain, with the text centred in it.
        { display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, paddingBottom: 16 },
        ...(page.icon
          ? [
              h(
                'div',
                {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  backgroundColor: BRAND,
                  marginBottom: 24,
                },
                img(iconSvg(page.icon, '#fff'), { width: 36, height: 36 }),
              ),
            ]
          : []),
        h(
          'div',
          {
            fontFamily: 'Bricolage Grotesque',
            fontWeight: 800,
            fontSize: titleSize(page.title),
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            color: '#fff',
          },
          page.title,
        ),
        h(
          'div',
          {
            fontFamily: 'Bricolage Grotesque',
            fontWeight: 800,
            fontSize: placeSize(page.place),
            lineHeight: 1.1,
            letterSpacing: '-0.015em',
            color: BRAND,
            marginTop: 6,
          },
          page.place,
        ),
        h(
          'div',
          {
            fontFamily: 'IBM Plex Sans',
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.35,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 20,
            maxWidth: 580,
          },
          page.subtitle,
        ),
      ),
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          marginTop: 'auto',
          fontFamily: 'IBM Plex Sans',
          fontWeight: 600,
          fontSize: 24,
          color: '#fff',
        },
        h('div', { width: 40, height: 4, borderRadius: 2, backgroundColor: BRAND, marginRight: 12 }),
        SITE.domain,
      ),
    ),
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], { width: WIDTH, height: HEIGHT, fonts });
  return sharp(Buffer.from(svg)).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
}

export function ogResponse(jpg: Buffer) {
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
}
