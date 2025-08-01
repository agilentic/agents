from dataclasses import dataclass
from typing import Dict
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.llms import OpenAI
from langchain.chains import LLMChain
from ai_hawk.utils.prompts import JOB_MATCH_PROMPT

@dataclass
class JobMatcherAgent:
    cv: str

    def __post_init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.llm = OpenAI()
        self.chain = LLMChain(llm=self.llm, prompt=JOB_MATCH_PROMPT)

    def match(self, job: Dict) -> Dict:
        prompt = JOB_MATCH_PROMPT.format(job_description=job['description'], cv=self.cv)
        score = self.llm(prompt)
        return {'job': job, 'score': score}
