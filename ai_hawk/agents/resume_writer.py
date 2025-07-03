from dataclasses import dataclass
from typing import Dict
from langchain.llms import OpenAI
from ai_hawk.utils.prompts import COVER_LETTER_PROMPT

@dataclass
class ResumeWriterAgent:
    resume_template: str

    def __post_init__(self):
        self.llm = OpenAI()

    def write_cover_letter(self, job: Dict) -> str:
        prompt = COVER_LETTER_PROMPT.format(job_description=job['description'], resume=self.resume_template)
        return self.llm(prompt)
