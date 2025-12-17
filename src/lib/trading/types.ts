export interface MarketQuote {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export type TradeAction = "buy" | "sell" | "hold";

export interface TradeRecommendation {
  symbol: string;
  action: TradeAction;
  conviction: number;
  rationale: string;
  riskNotes: string;
  targetAllocation?: number;
}

export interface PlannedOrder {
  symbol: string;
  side: Exclude<TradeAction, "hold">;
  quantity: number;
  limitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  rationale: string;
}

export interface TradeExecutionResult {
  order: PlannedOrder;
  status: "queued" | "executed" | "rejected";
  provider: string;
  id: string;
  paper: boolean;
  message?: string;
}

export interface TradingRunInput {
  watchlist: string[];
  capital: number;
  maxRiskPerTrade: number;
  maxPositions?: number;
}

export interface TradingRunOutput {
  quotes: MarketQuote[];
  recommendations: TradeRecommendation[];
  orders: PlannedOrder[];
  executions: TradeExecutionResult[];
}
