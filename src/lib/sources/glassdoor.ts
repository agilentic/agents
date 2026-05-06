import { chromium } from 'playwright';
import type { JobListing, SearchOptions } from './jobTypes';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchGlassdoorJobs(opts: SearchOptions = {}): Promise<JobListing[]> {
  const query    = encodeURIComponent(opts.query    ?? process.env.JOB_SEARCH_QUERY    ?? 'software engineer');
  const location = encodeURIComponent(opts.location ?? process.env.JOB_SEARCH_LOCATION ?? '');
  const max      = opts.maxResults ?? parseInt(process.env.MAX_RESULTS ?? '50');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA });
  const page    = await context.newPage();
  const jobs: JobListing[] = [];

  try {
    await page.goto(
      `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${query}&locKeyword=${location}`,
      { waitUntil: 'domcontentloaded', timeout: 30_000 }
    );
    await page.click('[id*="cookie"] button, [class*="cookie"] button').catch(() => null);
    await page.waitForSelector('[data-test="jobListing"], li.react-job-listing', { timeout: 15_000 }).catch(() => null);

    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, 700));
      await page.waitForTimeout(600 + Math.random() * 400);
    }

    const cards = await page.$$eval('[data-test="jobListing"], li.react-job-listing', (els) =>
      els.map((el) => ({
        title:    el.querySelector('[data-test="job-title"], .job-title')?.textContent?.trim() ?? '',
        company:  el.querySelector('[data-test="employer-name"], .employer-name')?.textContent?.trim() ?? '',
        location: el.querySelector('[data-test="emp-location"], .location')?.textContent?.trim() ?? '',
        link:     (el.querySelector('a') as HTMLAnchorElement)?.href ?? '',
        salary:   el.querySelector('[data-test="detailSalary"], .salary-estimate')?.textContent?.trim() ?? '',
      }))
    );

    for (const c of cards.slice(0, max)) {
      if (!c.title || !c.link) continue;
      jobs.push({
        id: `gd-${Buffer.from(c.link).toString('base64').slice(0, 16)}`,
        title: c.title, company: c.company, location: c.location,
        platform: 'Glassdoor',
        link: c.link.startsWith('http') ? c.link : `https://www.glassdoor.com${c.link}`,
        salary: c.salary || undefined,
      });
    }
  } finally {
    await browser.close();
  }
  return jobs;
}
