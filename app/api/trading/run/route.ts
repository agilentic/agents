import { NextRequest, NextResponse } from "next/server";
import { runTradingAutomation } from "../../../../src/lib/agents/tradingTeam";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const watchlistInput = body.watchlist;

  const watchlist = Array.isArray(watchlistInput)
    ? watchlistInput
    : typeof watchlistInput === "string"
    ? watchlistInput
        .split(/[,\s]+/)
        .map((s: string) => s.trim())
        .filter(Boolean)
    : ["AAPL", "MSFT", "GOOG"];

  const capital = Number(body.capital ?? 10000);
  const maxRiskPerTrade = Number(body.maxRiskPerTrade ?? 0.02);
  const maxPositions = body.maxPositions ? Number(body.maxPositions) : undefined;

  const result = await runTradingAutomation({
    watchlist,
    capital,
    maxRiskPerTrade,
    maxPositions,
  });

  return NextResponse.json(result);
}
