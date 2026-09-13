# Axion Science SEO standard

This document defines the SEO contract for the four independent applications.
The products keep separate repositories and deployments, but their public
metadata and crawl policy should remain consistent.

## Canonical public URLs

| Product | Canonical host | Public pages |
| --- | --- | --- |
| Science Hub / Library | `https://dirac.space` | `/`, `/problems`, `/problems/led-design` |
| Mathematics | `https://math.dirac.space` | `/`, `/laboratory`, `/laboratory/<slug>` |
| Notebook | `https://notebook.dirac.space` | `/` |
| Writer | `https://writer.dirac.space` | `/` |

The public hosts are configured in each app's `lib/seo.ts`. Do not use the VPS
IP, an app port, or a development URL in canonical links, Open Graph URLs, or
structured data.

## Indexing policy

Public product pages and the structured problem case are indexable. Research
projects, notebook workspaces, document archives, editors, and project results
are application surfaces; they are marked `noindex, nofollow` and excluded
from their sitemap. This prevents private or mostly client-rendered state from
becoming search results while keeping the product landing pages discoverable.

API paths are disallowed in `robots.ts` for every app.

## Required implementation

Each app must provide:

- root `Metadata` with `metadataBase`, title template, description, keywords,
  canonical URL, Open Graph, Twitter card, and robots policy;
- `app/robots.ts` with a sitemap URL and API exclusion;
- `app/sitemap.ts` containing only stable public URLs;
- JSON-LD for the application or Science Hub in the root layout;
- route-level metadata for public dynamic pages;
- route-level `noindex` metadata for private workspaces.

Use one clear `h1` per page, meaningful `h2` headings, descriptive link text,
and real HTML text for important content. Decorative SVG and animated scenes
must stay `aria-hidden` or `role="presentation"`.

## Landing-page content rule

The landing pages use a compact five-part hierarchy:

1. product promise and one primary action;
2. one product preview;
3. the focused workflow;
4. the ecosystem handoff;
5. one final call to action.

Repeated capability panels and secondary marketing claims should not be added
back to the landing pages. Detailed implementation and deployment claims belong
in product documentation or the workspace UI.

## Verification checklist

Run each app's build and inspect the generated routes:

```bash
npm run build
```

Then verify in production:

```text
https://<host>/robots.txt
https://<host>/sitemap.xml
```

Check that public pages contain one canonical link, a useful title and
description, and JSON-LD. Check that private pages contain
`noindex,nofollow`. Re-run this checklist after changing domains, route
prefixes, or the reverse proxy.

## Deployment note

The current direct-Hostinger deployment terminates HTTPS at nginx and serves
the apps from subdomains. Keep the private `.env.production` values aligned
with these hosts, but never commit secrets or deployment credentials. The
deployment template lives at `ops/nginx-dirac.space.conf`.
