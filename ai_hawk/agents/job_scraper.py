from dataclasses import dataclass
from typing import List, Dict
from playwright.sync_api import sync_playwright

@dataclass
class JobScraperAgent:
    sources: List[str]

    def scrape(self, query: str) -> List[Dict]:
        """Scrape job postings from configured sources."""
        jobs = []
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            for source in self.sources:
                url = source.format(query=query)
                try:
                    page.goto(url)
                    page.wait_for_timeout(3000)
                    listings = page.locator('article')
                    for i in range(listings.count()):
                        title = listings.nth(i).locator('h3').inner_text()
                        link = listings.nth(i).locator('a').get_attribute('href')
                        jobs.append({'title': title, 'link': link})
                except Exception:
                    continue
            browser.close()
        return jobs
