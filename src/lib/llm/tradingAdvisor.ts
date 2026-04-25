import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { MarketQuote, TradeRecommendation } from "../trading/types";

function stripCodeFences(payload: string): string {
  return payload.replace(/```json/gi, "").replace(/```/g, "").trim();
}

export async function analyzeMarket(quotes: MarketQuote[]): Promise<TradeRecommendation[]> {
  const model = new ChatOpenAI({ modelName: "gpt-4o", temperature: 0.2 });
  const prompt = PromptTemplate.fromTemplate(
    `You are a cautious portfolio manager. Given intraday quotes, propose risk-aware trade actions.\n` +
      `Return JSON array of objects with keys: symbol, action (buy|sell|hold), conviction (0-1), rationale, riskNotes, targetAllocation (percentage of capital).\n` +
      `Prioritize diversification, avoid over-trading, and only recommend actions with clear edge.\nQuotes: {quotes}`
  );

  const chain = new LLMChain({ llm: model, prompt });
  const result = await chain.call({ quotes: JSON.stringify(quotes, null, 2) });
  const raw = stripCodeFences(result.text ?? "[]");

  let parsed: unknown = [];
  try {
    parsed = JSON.parse(raw || "[]");
  } catch (error) {
    console.error("Failed to parse trading LLM response", error);
  }

  return Array.isArray(parsed)
    ? parsed.map((entry) => ({
        symbol: (entry as any).symbol,
        action: (entry as any).action,
        conviction: Number((entry as any).conviction ?? 0),
        rationale: (entry as any).rationale ?? "",
        riskNotes: (entry as any).riskNotes ?? "",
        targetAllocation: (entry as any).targetAllocation,
      }))
    : [];
}
