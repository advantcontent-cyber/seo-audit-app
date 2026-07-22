import * as cheerio from "cheerio";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  category: "crawl" | "on-page" | "technical" | "performance";
  severity: Severity;
  title: string;
  detail: string;
  url?: string;
}

export interface PageData {
  url: string;
  status: number;
  redirected: boolean;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  hasSchema: boolean;
  canonical: string | null;
}

export interface AuditResult {
  domain: string;
  startedAt: string;
  pagesChecked: number;
  findings: Finding[];
  summary: Record<Severity, number>;
}

const MAX_PAGES = 20; // v1 crawl limit — keep runs fast; raise once this is proven out
const FETCH_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

function normalizeDomain(input: string): string {
  let d = input.trim();
  if (!/^https?:\/\//i.test(d)) d = `https://${d}`;
  return d.replace(/\/$/, "");
}

async function checkRobotsAndSitemap(baseUrl: string): Promise<{ findings: Finding[]; sitemapUrls: string[] }> {
  const findings: Finding[] = [];
  let sitemapUrls: string[] = [];

  try {
    const res = await fetchWithTimeout(`${baseUrl}/robots.txt`);
    if (!res.ok) {
      findings.push({
        category: "technical",
        severity: "medium",
        title: "robots.txt missing or unreachable",
        detail: `${baseUrl}/robots.txt returned status ${res.status}`,
      });
    } else {
      const text = await res.text();
      const sitemapLines = text.split("\n").filter((l) => l.toLowerCase().startsWith("sitemap:"));
      if (sitemapLines.length === 0) {
        findings.push({
          category: "technical",
          severity: "low",
          title: "No sitemap declared in robots.txt",
          detail: "robots.txt exists but does not reference a sitemap.",
        });
      } else {
        for (const line of sitemapLines) {
          const url = line.split(":").slice(1).join(":").trim();
          if (url) sitemapUrls.push(url);
        }
      }
    }
  } catch {
    findings.push({
      category: "technical",
      severity: "medium",
      title: "robots.txt request failed",
      detail: `Could not fetch ${baseUrl}/robots.txt`,
    });
  }

  // fallback: try default sitemap location
  if (sitemapUrls.length === 0) {
    sitemapUrls.push(`${baseUrl}/sitemap.xml`);
  }

  let pageUrls: string[] = [];
  for (const sitemapUrl of sitemapUrls) {
    try {
      const res = await fetchWithTimeout(sitemapUrl);
      if (!res.ok) {
        findings.push({
          category: "technical",
          severity: "high",
          title: "Sitemap unreachable",
          detail: `${sitemapUrl} returned status ${res.status}`,
        });
        continue;
      }
      const xml = await res.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      $("url > loc, sitemap > loc").each((_, el) => {
        const loc = $(el).text().trim();
        if (loc) pageUrls.push(loc);
      });
    } catch {
      findings.push({
        category: "technical",
        severity: "high",
        title: "Sitemap request failed",
        detail: `Could not fetch ${sitemapUrl}`,
      });
    }
  }

  return { findings, sitemapUrls: pageUrls };
}

async function checkPage(url: string): Promise<{ page: PageData | null; findings: Finding[] }> {
  const findings: Finding[] = [];
  try {
    const res = await fetchWithTimeout(url);
    const redirected = res.redirected;
    if (redirected) {
      findings.push({
        category: "crawl",
        severity: "low",
        title: "Page redirects",
        detail: `${url} redirected to ${res.url}`,
        url,
      });
    }
    if (!res.ok) {
      findings.push({
        category: "crawl",
        severity: "critical",
        title: `Page returns ${res.status}`,
        detail: `${url} is broken or inaccessible.`,
        url,
      });
      return { page: null, findings };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $("title").first().text().trim() || null;
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
    const h1Count = $("h1").length;
    const hasSchema = $('script[type="application/ld+json"]').length > 0;
    const canonical = $('link[rel="canonical"]').attr("href") || null;

    if (!title) {
      findings.push({ category: "on-page", severity: "high", title: "Missing <title>", detail: "Page has no title tag.", url });
    } else if (title.length > 60) {
      findings.push({
        category: "on-page",
        severity: "low",
        title: "Title tag too long",
        detail: `Title is ${title.length} characters (recommended under 60).`,
        url,
      });
    }

    if (!metaDescription) {
      findings.push({
        category: "on-page",
        severity: "medium",
        title: "Missing meta description",
        detail: "Page has no meta description.",
        url,
      });
    } else if (metaDescription.length > 160) {
      findings.push({
        category: "on-page",
        severity: "low",
        title: "Meta description too long",
        detail: `Meta description is ${metaDescription.length} characters (recommended under 160).`,
        url,
      });
    }

    if (h1Count === 0) {
      findings.push({ category: "on-page", severity: "high", title: "Missing H1", detail: "Page has no H1 heading.", url });
    } else if (h1Count > 1) {
      findings.push({
        category: "on-page",
        severity: "low",
        title: "Multiple H1 tags",
        detail: `Page has ${h1Count} H1 tags; expected 1.`,
        url,
      });
    }

    if (!hasSchema) {
      findings.push({
        category: "technical",
        severity: "medium",
        title: "No structured data found",
        detail: "No JSON-LD schema markup detected on this page.",
        url,
      });
    }

    if (!url.startsWith("https://")) {
      findings.push({ category: "technical", severity: "critical", title: "Page not served over HTTPS", detail: url, url });
    }

    return {
      page: { url, status: res.status, redirected, title, metaDescription, h1Count, hasSchema, canonical },
      findings,
    };
  } catch (e) {
    findings.push({
      category: "crawl",
      severity: "critical",
      title: "Page request failed",
      detail: `Could not fetch ${url}: ${(e as Error).message}`,
      url,
    });
    return { page: null, findings };
  }
}

function checkDuplicates(pages: PageData[]): Finding[] {
  const findings: Finding[] = [];
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();

  for (const p of pages) {
    if (p.title) titleMap.set(p.title, [...(titleMap.get(p.title) || []), p.url]);
    if (p.metaDescription) descMap.set(p.metaDescription, [...(descMap.get(p.metaDescription) || []), p.url]);
  }

  for (const [title, urls] of titleMap) {
    if (urls.length > 1) {
      findings.push({
        category: "on-page",
        severity: "high",
        title: "Duplicate title tag",
        detail: `"${title}" is used on ${urls.length} pages: ${urls.join(", ")}`,
      });
    }
  }
  for (const [desc, urls] of descMap) {
    if (urls.length > 1) {
      findings.push({
        category: "on-page",
        severity: "medium",
        title: "Duplicate meta description",
        detail: `Same meta description used on ${urls.length} pages: ${urls.join(", ")}`,
      });
    }
  }
  return findings;
}

async function checkPageSpeed(url: string, apiKey: string | undefined): Promise<Finding[]> {
  if (!apiKey) {
    return [
      {
        category: "performance",
        severity: "low",
        title: "PageSpeed check skipped",
        detail: "No PAGESPEED_API_KEY configured — Core Web Vitals not checked for this run.",
      },
    ];
  }
  const findings: Finding[] = [];
  try {
    const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&key=${apiKey}&strategy=mobile&category=performance`;
    const res = await fetchWithTimeout(endpoint, 20000);
    if (!res.ok) {
      findings.push({
        category: "performance",
        severity: "low",
        title: "PageSpeed check failed",
        detail: `API returned status ${res.status}`,
        url,
      });
      return findings;
    }
    const data = await res.json();
    const score = data?.lighthouseResult?.categories?.performance?.score;
    const lcp = data?.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue;
    const cls = data?.lighthouseResult?.audits?.["cumulative-layout-shift"]?.numericValue;

    if (typeof score === "number" && score < 0.5) {
      findings.push({
        category: "performance",
        severity: "high",
        title: "Poor mobile performance score",
        detail: `Lighthouse performance score: ${Math.round(score * 100)}/100`,
        url,
      });
    } else if (typeof score === "number" && score < 0.9) {
      findings.push({
        category: "performance",
        severity: "medium",
        title: "Mobile performance needs improvement",
        detail: `Lighthouse performance score: ${Math.round(score * 100)}/100`,
        url,
      });
    }
    if (typeof lcp === "number" && lcp > 2500) {
      findings.push({
        category: "performance",
        severity: lcp > 4000 ? "high" : "medium",
        title: "Largest Contentful Paint above target",
        detail: `LCP: ${(lcp / 1000).toFixed(1)}s (target under 2.5s)`,
        url,
      });
    }
    if (typeof cls === "number" && cls > 0.1) {
      findings.push({
        category: "performance",
        severity: cls > 0.25 ? "high" : "medium",
        title: "Cumulative Layout Shift above target",
        detail: `CLS: ${cls.toFixed(2)} (target under 0.1)`,
        url,
      });
    }
  } catch (e) {
    findings.push({
      category: "performance",
      severity: "low",
      title: "PageSpeed check errored",
      detail: (e as Error).message,
      url,
    });
  }
  return findings;
}

export async function runAudit(domainInput: string, pagespeedApiKey?: string): Promise<AuditResult> {
  const baseUrl = normalizeDomain(domainInput);
  const findings: Finding[] = [];

  const { findings: robotsFindings, sitemapUrls } = await checkRobotsAndSitemap(baseUrl);
  findings.push(...robotsFindings);

  const urlsToCheck = (sitemapUrls.length > 0 ? sitemapUrls : [baseUrl]).slice(0, MAX_PAGES);
  const pages: PageData[] = [];

  for (const url of urlsToCheck) {
    const { page, findings: pageFindings } = await checkPage(url);
    findings.push(...pageFindings);
    if (page) pages.push(page);
  }

  findings.push(...checkDuplicates(pages));

  // Core Web Vitals — homepage only in v1 to keep API usage/time bounded
  findings.push(...(await checkPageSpeed(baseUrl, pagespeedApiKey)));

  const summary: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) summary[f.severity]++;

  return {
    domain: baseUrl,
    startedAt: new Date().toISOString(),
    pagesChecked: pages.length,
    findings: findings.sort((a, b) => {
      const order: Severity[] = ["critical", "high", "medium", "low"];
      return order.indexOf(a.severity) - order.indexOf(b.severity);
    }),
    summary,
  };
}
