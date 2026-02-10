import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const site = import.meta.env.SITE || 'https://sungjinlogis.com';

  const paths = [
    '/',

    // Korean
    '/kr/',
    '/kr/company/',
    '/kr/capabilities/',
    '/kr/capabilities/robotic-pretreatment/',
    '/kr/capabilities/matte-satin/',
    '/kr/capabilities/trivalent-chrome/',
    '/kr/capabilities/acid-copper/',
    '/kr/capabilities/bright-nickel/',
    '/kr/capabilities/semi-bright-nickel/',
    '/kr/quality/',
    '/kr/facilities/',
    '/kr/industries/',
    '/kr/downloads/',
    '/kr/contact/',

    // English
    '/en/',
    '/en/company/',
    '/en/capabilities/',
    '/en/capabilities/robotic-pretreatment/',
    '/en/capabilities/matte-satin/',
    '/en/capabilities/trivalent-chrome/',
    '/en/capabilities/acid-copper/',
    '/en/capabilities/bright-nickel/',
    '/en/capabilities/semi-bright-nickel/',
    '/en/quality/',
    '/en/facilities/',
    '/en/industries/',
    '/en/downloads/',
    '/en/contact/',
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${site}${path}</loc>
  </url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
