import { chromium } from "playwright";
import { ApplyOptions } from "./types";

/**
 * Automate LinkedIn application using Playwright.
 * Assumes authentication state stored in auth.json.
 */
export async function applyLinkedIn(opts: ApplyOptions): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: "auth.json" });
  const page = await context.newPage();
  try {
    await page.goto(opts.jobLink, { waitUntil: "networkidle" });
    await page.click('button[data-control-name="jobdetails_topcard_inapply"]');
    await page.fill('textarea[name="resume"]', opts.optimizedCv);
    await page.fill('textarea[name="coverLetter"]', opts.coverLetter);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Application submitted', { timeout: 10000 });
  } finally {
    await context.close();
    await browser.close();
  }
}
