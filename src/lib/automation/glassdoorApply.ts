import { chromium } from "playwright";
import { ApplyOptions } from "./types";

/**
 * Automate Glassdoor application using Playwright.
 * This is a simplified flow and may require adjustments for production.
 */
export async function applyGlassdoor(opts: ApplyOptions): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: "glassdoorAuth.json" });
  const page = await context.newPage();
  try {
    await page.goto(opts.jobLink, { waitUntil: "networkidle" });
    await page.click('button:has-text("Apply")');
    await page.fill('textarea[name="resume"]', opts.optimizedCv);
    await page.fill('textarea[name="coverLetter"]', opts.coverLetter);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  } finally {
    await context.close();
    await browser.close();
  }
}
