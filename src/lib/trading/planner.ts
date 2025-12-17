import { MarketQuote, PlannedOrder, TradeRecommendation } from "./types";

export interface RiskConstraints {
  capital: number;
  maxRiskPerTrade: number;
  maxPositions: number;
}

export function buildOrders(
  quotes: MarketQuote[],
  recommendations: TradeRecommendation[],
  constraints: RiskConstraints
): PlannedOrder[] {
  const budgetPerTrade = constraints.capital * constraints.maxRiskPerTrade;
  const maxPositions = Math.max(1, constraints.maxPositions);
  const allocationPerTrade = Math.min(budgetPerTrade, constraints.capital / maxPositions);

  return recommendations
    .filter((rec) => rec.action !== "hold")
    .map((rec) => {
      const quote = quotes.find((q) => q.symbol === rec.symbol);
      const price = quote?.price ?? 0;
      const quantity = price > 0 ? Math.max(1, Math.floor(allocationPerTrade / price)) : 0;

      return {
        symbol: rec.symbol,
        side: rec.action === "sell" ? "sell" : "buy",
        quantity,
        limitPrice: price || undefined,
        stopLoss: price ? Number((price * 0.98).toFixed(2)) : undefined,
        takeProfit: price ? Number((price * 1.04).toFixed(2)) : undefined,
        rationale: rec.rationale,
      } satisfies PlannedOrder;
    })
    .filter((order) => order.quantity > 0);
}
