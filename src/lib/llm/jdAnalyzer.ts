import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

export interface JDAnalysis {
  keywords: string[];
  summary: string;
}

/**
 * Analyze a job description and extract key info using GPT-4o.
 */
export async function analyzeJobDescription(jd: string): Promise<JDAnalysis> {
  const model = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.2 });
  const prompt = PromptTemplate.fromTemplate(`You are an expert recruiter. Extract the five most important skills as a comma separated list and a short summary.\nJob Description: {jd}\nRespond as JSON with keys 'keywords' and 'summary'.`);

  const chain = new LLMChain({ llm: model, prompt });
  const result = await chain.call({ jd });
  const parsed = JSON.parse(result.text.trim());
  return {
    keywords: parsed.keywords,
    summary: parsed.summary,
  };
}
