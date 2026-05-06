import { chromium } from 'playwright';
import type { JobListing, SearchOptions } from './jobTypes';
import { readFileSync } from 'fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchLinkedInJobs(opts: SearchOptions = {}): Promise<JobListing[]> {
  const query    = encodeURIComponent(opts.query    ?? process.env.JOB_SEARCH_QUERY    ?? 'software engineer');
  const location = encodeURIComponent(opts.location ?? process.env.JOB_SEARCH_LOCATION ?? '');
  const max      = opts.maxResults ?? parseInt(process.env.MAX_RESULTS ?? '50');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA });

  const cookiesPath = opts.cookiesPath ?? process.env.LINKEDIN_COOKIES_PATH;
  if (cookiesPath) {
    try { await context.addCookies(JSON.parse(readFileSync(cookiesPath, 'utf-8'))); } catch {}
  }

  const page = await context.newPage();
  const jobs: JobListing[] = [];

  try {
    await page.goto(
      `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${location}&f_TPR=r86400`,
      { waitUntil: 'domcontentloaded', timeout: 30_000 }
    );
    await page.waitForSelector('.base-search-card', { timeout: 15_000 }).catch(() => null);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 700));
      await page.waitForTimeout(700 + Math.random() * 300);
    }

    const cards = await page.$$eval('.job-search-card, .base-search-card', (els) =>
      els.map((el) => ({
        title:    el.querySelector('.base-search-card__title')?.textContent?.trim() ?? '',
        company:  el.querySelector('.base-search-card__subtitle a, .base-search-card__subtitle')?.textContent?.trim() ?? '',
        location: el.querySelector('.job-search-card__location')?.textContent?.trim() ?? '',
        link:     (el.querySelector('a.base-card__full-link') as HTMLAnchorElement)?.href ?? '',
        postedAt: el.querySelector('time')?.getAttribute('datetime') ?? '',
        easyApply: !!el.querySelector('.job-search-card__easy-apply-label'),
      }))
    );

    for (const c of cards.slice(0, max)) {
      if (!c.title || !c.link) continue;
      jobs.push({
        id: `li-${Buffer.from(c.link).toString('base64').slice(0, 16)}`,
        title: c.title, company: c.company, location: c.location,
        platform: 'LinkedIn', link: c.link,
        postedAt: c.postedAt || undefined, easyApply: c.easyApply,
      });
    }
  } finally {
    await browser.close();
  }
  return jobs;
}

export const fetchJobs = fetchLinkedInJobs;
