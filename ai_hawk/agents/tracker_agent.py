from dataclasses import dataclass
from typing import Dict
from notion_client import Client as NotionClient
from airtable import Airtable
from ai_hawk.utils import config

@dataclass
class TrackerAgent:
    notion_db_id: str
    airtable_base: str
    airtable_table: str

    def __post_init__(self):
        self.notion = NotionClient(auth=config.NOTION_API_KEY)
        self.airtable = Airtable(self.airtable_base, self.airtable_table, api_key=config.AIRTABLE_API_KEY)

    def log(self, job: Dict, status: str):
        self.notion.pages.create(
            parent={'database_id': self.notion_db_id},
            properties={
                'Name': {'title': [{'text': {'content': job['title']}}]},
                'Status': {'rich_text': [{'text': {'content': status}}]},
                'Link': {'url': job['link']}
            }
        )
        self.airtable.insert({'Name': job['title'], 'Status': status, 'Link': job['link']})
