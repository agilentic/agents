from dataclasses import dataclass
from typing import Dict
from playwright.sync_api import sync_playwright

@dataclass
class ApplicationAgent:
    def apply(self, job: Dict, resume: str, cover_letter: str) -> bool:
        """Automate the application form."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.goto(job['link'])
                page.fill('input[name="resume"]', resume)
                page.fill('textarea[name="cover_letter"]', cover_letter)
                page.click('button[type="submit"]')
                page.wait_for_timeout(2000)
                return True
            except Exception:
                return False
            finally:
                browser.close()
