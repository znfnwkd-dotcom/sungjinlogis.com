import type { APIRoute } from 'astro';

const BASE = 'https://www.sungjinlogis.com';

const paths = [
  '/',
  '/kr/',
  '/kr/company/',
  '/kr/capabilities/',
  '/kr/quality/',
  '/kr/facilities/',
  '/kr/industries/',
  '/kr/downloads/',
  '/kr/contact/',
  '/en/'
];

export const GET: APIRoute = async () => {
  const now = new Date().toISOString();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (p) => `  <url>\n    <loc>${BASE}${p}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
