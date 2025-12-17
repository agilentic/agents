import { AgentTeam } from "./team";
import { Agent, AgentMessage } from "./types";
import { fetchMarketSnapshot } from "../trading/marketData";
import { analyzeMarket } from "../llm/tradingAdvisor";
import { buildOrders, RiskConstraints } from "../trading/planner";
import { executeOrders } from "../automation/broker";
import {
  MarketQuote,
  PlannedOrder,
  TradeExecutionResult,
  TradeRecommendation,
  TradingRunInput,
  TradingRunOutput,
} from "../trading/types";

class MarketDataAgent implements Agent {
  name = "marketData";

  async act(message: AgentMessage): Promise<AgentMessage> {
    const config = message.data?.config as (RiskConstraints & { watchlist: string[] }) | undefined;
    const symbols = config?.watchlist?.length ? config.watchlist : [];
    const quotes = symbols.length ? await fetchMarketSnapshot(symbols) : [];
    return { content: "market-data", data: { ...message.data, quotes } };
  }
}

class StrategyAgent implements Agent {
  name = "strategy";

  async act(message: AgentMessage): Promise<AgentMessage> {
    const quotes = (message.data?.quotes ?? []) as MarketQuote[];
    const recommendations = await analyzeMarket(quotes);
    return { content: "strategy", data: { ...message.data, recommendations } };
  }
}

class PlannerAgent implements Agent {
  name = "planner";

  async act(message: AgentMessage): Promise<AgentMessage> {
    const { quotes = [], recommendations = [], config } = message.data ?? {};
    const orders = buildOrders(
      quotes as MarketQuote[],
      recommendations as TradeRecommendation[],
      (config as RiskConstraints) ?? { capital: 0, maxRiskPerTrade: 0, maxPositions: 1 }
    );
    return { content: "planned", data: { ...message.data, orders } };
  }
}

class ExecutionAgent implements Agent {
  name = "execution";

  async act(message: AgentMessage): Promise<AgentMessage> {
    const orders = (message.data?.orders ?? []) as PlannedOrder[];
    const executions = await executeOrders(orders);
    return { content: "executed", data: { ...message.data, executions } };
  }
}

export async function runTradingAutomation(input: TradingRunInput): Promise<TradingRunOutput> {
  const config: RiskConstraints & { watchlist: string[] } = {
    capital: input.capital,
    maxRiskPerTrade: input.maxRiskPerTrade,
    maxPositions: input.maxPositions ?? Math.max(1, input.watchlist.length),
    watchlist: input.watchlist,
  };

  const team = new AgentTeam([new MarketDataAgent(), new StrategyAgent(), new PlannerAgent(), new ExecutionAgent()]);
  const result = await team.run({ content: "start", data: { config } });

  return {
    quotes: (result.data?.quotes ?? []) as MarketQuote[],
    recommendations: (result.data?.recommendations ?? []) as TradeRecommendation[],
    orders: (result.data?.orders ?? []) as PlannedOrder[],
    executions: (result.data?.executions ?? []) as TradeExecutionResult[],
  };
}
