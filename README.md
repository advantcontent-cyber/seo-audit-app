# SEO Audit Tool (v1)

Automates the first stage of the SEO workflow: **Technical SEO Audit**.

v1 scope: crawlable-data checks only (no Search Console integration — that's v2, once
API access to client properties is set up).

## What it checks

- **Crawl:** robots.txt presence, sitemap.xml validity, broken pages (4xx/5xx), redirects
- **On-page:** missing/duplicate titles & meta descriptions, title/description length, H1 count, duplicate content across pages
- **Technical:** HTTPS, structured data (JSON-LD) presence
- **Performance:** Core Web Vitals (LCP, CLS) and mobile Lighthouse score via PageSpeed Insights API (optional — skipped if no API key is set)

Findings are scored **critical / high / medium / low** and every run is saved to Supabase for history.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** (or reuse the one from seo-tracker-app if you'd rather keep audit history alongside it — just run the schema below in that project instead).
   - Run `supabase-schema.sql` in the Supabase SQL editor to create the `audit_runs` table.
   - Copy the Project URL and `service_role` key from Settings → API.

3. **Get a PageSpeed Insights API key** (optional, but needed for the Performance checks)
   - Enable the "PageSpeed Insights API" in Google Cloud Console → create an API key.

4. **Set environment variables** — copy `.env.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   SUPABASE_SERVICE_ROLE_KEY=
   PAGESPEED_API_KEY=
   ```

5. **Run locally**
   ```bash
   npm run dev
   ```

6. **Deploy** — push to a new GitHub repo and import into Vercel (same flow as seo-tracker-app), then add the same env vars in Vercel's project settings.

## Known v1 limits (by design, to keep the first version simple)

- Crawls up to 20 URLs per run (from the sitemap, or just the homepage if no sitemap is found)
- No auth/multi-tenant support yet — it's a single shared tool, not scoped per client login
- No scheduled/recurring runs yet — manual trigger only
- Search Console (indexation/coverage data) isn't included

## Natural next steps

- Add Search Console once client property access is confirmed
- Scheduled weekly audits (cron, like the rank tracker) with email/Slack digest of new critical/high findings
- Per-client history view and trend chart (findings over time)
- Feed prioritized findings into an AI pass that drafts the "recommendations" section of the client report automatically
