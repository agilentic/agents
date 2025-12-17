import { runTradingAutomation } from "../src/lib/agents/tradingTeam";

async function main() {
  const result = await runTradingAutomation({
    watchlist: ["AAPL", "MSFT", "GOOG"],
    capital: 10000,
    maxRiskPerTrade: 0.02,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
