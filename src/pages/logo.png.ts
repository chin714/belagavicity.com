import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

// Square PNG logo for the Organization schema; Google wants a raster image of at least 112×112.
export const GET: APIRoute = async () => {
  const svg = await readFile(resolve('src/assets/brand/logo-mark.svg'));
  const png = await sharp(svg, { density: 576 }).resize(512, 512).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
