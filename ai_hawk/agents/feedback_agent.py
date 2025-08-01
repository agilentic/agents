from dataclasses import dataclass
from langchain.llms import OpenAI

@dataclass
class FeedbackAgent:
    def __post_init__(self):
        self.llm = OpenAI()

    def analyze(self, rejection_reason: str) -> str:
        prompt = f"Given the rejection reason: {rejection_reason}, how can the next application be improved?"
        return self.llm(prompt)
