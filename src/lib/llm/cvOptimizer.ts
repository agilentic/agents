import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate, LLMChain } from "langchain";

/**
 * Given a user's CV and target keywords, return an optimized version
 * tailored for the job.
 */
export async function optimizeCv(cv: string, keywords: string[]): Promise<string> {
  const model = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.3 });
  const prompt = PromptTemplate.fromTemplate(`You are a career coach. Improve the CV below to emphasize the following keywords: {keywords}.\nCV:{cv}\nReturn ONLY the improved CV.`);

  const chain = new LLMChain({ llm: model, prompt });
  const result = await chain.call({ keywords: keywords.join(", "), cv });
  return result.text.trim();
}
