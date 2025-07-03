from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / '.env'
load_dotenv(ENV_PATH)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
NOTION_API_KEY = os.getenv('NOTION_API_KEY')
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')
GMAIL_API_KEY = os.getenv('GMAIL_API_KEY')
