import { chromium } from 'playwright';
import type { JobListing, SearchOptions } from './jobTypes';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchEFinancialCareersJobs(opts: SearchOptions = {}): Promise<JobListing[]> {
  const query    = encodeURIComponent(opts.query    ?? process.env.JOB_SEARCH_QUERY    ?? 'software engineer');
  const location = encodeURIComponent(opts.location ?? process.env.JOB_SEARCH_LOCATION ?? '');
  const max      = opts.maxResults ?? parseInt(process.env.MAX_RESULTS ?? '50');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA });
  const page    = await context.newPage();
  const jobs: JobListing[] = [];

  try {
    await page.goto(
      `https://www.efinancialcareers.com/search?q=${query}&location=${location}`,
      { waitUntil: 'domcontentloaded', timeout: 30_000 }
    );
    await page.click('button[id*="accept"], button[class*="accept"]').catch(() => null);
    await page.waitForSelector('.job-item, [data-cy="job-card"], article.job', { timeout: 15_000 }).catch(() => null);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 700));
      await page.waitForTimeout(600 + Math.random() * 400);
    }

    const cards = await page.$$eval('.job-item, [data-cy="job-card"], article.job', (els) =>
      els.map((el) => ({
        title:    el.querySelector('h2, h3, .job-title, [data-cy="job-title"]')?.textContent?.trim() ?? '',
        company:  el.querySelector('.company-name, [data-cy="company-name"]')?.textContent?.trim() ?? '',
        location: el.querySelector('.location, [data-cy="location"]')?.textContent?.trim() ?? '',
        link:     (el.querySelector('a') as HTMLAnchorElement)?.href ?? '',
        salary:   el.querySelector('.salary, [data-cy="salary"]')?.textContent?.trim() ?? '',
        postedAt: el.querySelector('time')?.getAttribute('datetime') ?? '',
      }))
    );

    for (const c of cards.slice(0, max)) {
      if (!c.title || !c.link) continue;
      jobs.push({
        id: `efc-${Buffer.from(c.link).toString('base64').slice(0, 16)}`,
        title: c.title, company: c.company, location: c.location,
        platform: 'eFinancialCareers',
        link: c.link.startsWith('http') ? c.link : `https://www.efinancialcareers.com${c.link}`,
        salary: c.salary || undefined, postedAt: c.postedAt || undefined,
      });
    }
  } finally {
    await browser.close();
  }
  return jobs;
}
