'use client';

import { useState } from "react";

interface TradingResult {
  quotes: { symbol: string; price: number; changePercent: number; volume: number }[];
  recommendations: { symbol: string; action: string; conviction: number; rationale: string; riskNotes: string; targetAllocation?: number }[];
  orders: { symbol: string; side: string; quantity: number; limitPrice?: number; stopLoss?: number; takeProfit?: number; rationale: string }[];
  executions: { status: string; provider: string; id: string; paper: boolean; message?: string; order: { symbol: string } }[];
}

export default function TradingPage() {
  const [watchlist, setWatchlist] = useState("AAPL, MSFT, GOOG");
  const [capital, setCapital] = useState(10000);
  const [risk, setRisk] = useState(0.02);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAgent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/trading/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchlist, capital, maxRiskPerTrade: risk }),
      });
      if (!response.ok) throw new Error("Failed to run trading agent");
      const data = (await response.json()) as TradingResult;
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-2">
        <p className="text-sm text-gray-500">Agentic trading control room</p>
        <h1 className="text-2xl font-semibold">LLM-Driven Stock Automation</h1>
        <p className="text-gray-600 max-w-2xl">
          Configure a watchlist and risk budget, then let the agent team fetch market data, generate strategy with GPT-4o, plan orders, and execute in paper mode unless broker credentials are provided.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Watchlist</span>
          <input
            className="rounded border px-3 py-2"
            value={watchlist}
            onChange={(e) => setWatchlist(e.target.value)}
            placeholder="AAPL, MSFT, GOOG"
          />
          <span className="text-xs text-gray-500">Comma or space separated tickers</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Capital (USD)</span>
          <input
            type="number"
            className="rounded border px-3 py-2"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
          />
          <span className="text-xs text-gray-500">Used for position sizing</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Risk per trade (fraction)</span>
          <input
            type="number"
            step="0.01"
            className="rounded border px-3 py-2"
            value={risk}
            onChange={(e) => setRisk(Number(e.target.value))}
          />
          <span className="text-xs text-gray-500">e.g. 0.02 = 2% of capital</span>
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          onClick={runAgent}
          disabled={loading}
        >
          {loading ? "Running agent..." : "Run trading agent"}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>

      {result && (
        <div className="space-y-4">
          <section>
            <h2 className="text-lg font-semibold">Market snapshot</h2>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {result.quotes.map((quote) => (
                <div key={quote.symbol} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{quote.symbol}</span>
                    <span className={quote.changePercent >= 0 ? "text-green-600" : "text-red-600"}>
                      {quote.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-gray-700">${quote.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Vol {quote.volume.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">LLM strategy</h2>
            <div className="space-y-2">
              {result.recommendations.map((rec) => (
                <div key={rec.symbol} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{rec.symbol}</span>
                    <span className="uppercase text-sm">{rec.action}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{rec.rationale}</p>
                  <p className="text-xs text-gray-500">Risk: {rec.riskNotes || "n/a"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold">Planned orders</h2>
              <div className="space-y-2">
                {result.orders.map((order) => (
                  <div key={`${order.symbol}-${order.side}`} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{order.symbol}</span>
                      <span className="uppercase text-sm">{order.side}</span>
                    </div>
                    <p className="text-gray-700 text-sm">Qty {order.quantity} @ {order.limitPrice ? `$${order.limitPrice}` : "MKT"}</p>
                    <p className="text-xs text-gray-500">{order.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Execution log</h2>
              <div className="space-y-2">
                {result.executions.map((exec) => (
                  <div key={exec.id} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{exec.order.symbol}</span>
                      <span className="text-sm">{exec.status}</span>
                    </div>
                    <p className="text-xs text-gray-500">{exec.provider} {exec.paper ? "(paper)" : ""}</p>
                    {exec.message && <p className="text-xs text-gray-600">{exec.message}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
