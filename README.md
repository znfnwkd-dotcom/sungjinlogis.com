# SUNGJINLOGIS Company Site (Astro + Cloudflare Pages)

This repository is a starter for **sungjinlogis.com**.

## Stack
- Astro (static site)
- TailwindCSS (metal + premium look, Ion Blue accent)
- Cloudflare Pages (free hosting) + Pages Functions (contact + downloads)

## Routes
- `/` language selector
- `/kr/` Korean site (full)
- `/en/` English site (placeholder)

## Deploy (Cloudflare Pages)
1. Push this repo to GitHub.
2. Cloudflare Dashboard → Pages → Create a project → Connect to GitHub → select repo.
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Set Environment Variables (Pages → Settings → Environment variables):
   - `RESEND_API_KEY`
   - `FROM_EMAIL` (e.g. `SUNGJINLOGIS <noreply@sungjinlogis.com>`)
   - `CONTACT_TO` (e.g. `chiwon1@kakao.net`)
   - `BROCHURE_URL` (URL to your PDF file)

## Email (Resend)
- For production, verify `sungjinlogis.com` in Resend and set `FROM_EMAIL` to your domain.
- For testing, you can use Resend's default sender addresses (see Resend dashboard).

## Content updates
See `CONTENT_GUIDE.md`.
