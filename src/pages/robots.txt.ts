import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://sungjinlogis.com/sitemap.xml",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
