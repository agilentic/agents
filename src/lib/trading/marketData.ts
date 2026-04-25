import { MarketQuote } from "./types";

const FALLBACK_QUOTES: MarketQuote[] = [
  {
    symbol: "AAPL",
    price: 187.63,
    changePercent: 0.42,
    volume: 52139872,
    timestamp: new Date().toISOString(),
  },
  {
    symbol: "MSFT",
    price: 416.17,
    changePercent: -0.18,
    volume: 26103942,
    timestamp: new Date().toISOString(),
  },
  {
    symbol: "GOOG",
    price: 144.88,
    changePercent: 0.31,
    volume: 19384211,
    timestamp: new Date().toISOString(),
  },
];

async function fetchAlphaVantageQuote(symbol: string, apiKey: string): Promise<MarketQuote | null> {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const json = await response.json();
  const quote = json["Global Quote"];
  if (!quote) return null;

  const price = parseFloat(quote["05. price"] ?? "0");
  const changePercent = parseFloat((quote["10. change percent"] ?? "0").replace("%", ""));
  const volume = parseInt(quote["06. volume"] ?? "0", 10);

  return {
    symbol,
    price: Number.isFinite(price) ? price : 0,
    changePercent: Number.isFinite(changePercent) ? changePercent : 0,
    volume: Number.isFinite(volume) ? volume : 0,
    timestamp: new Date().toISOString(),
  };
}

export async function fetchMarketSnapshot(symbols: string[]): Promise<MarketQuote[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return FALLBACK_QUOTES.filter((quote) => symbols.includes(quote.symbol)).concat(
      symbols
        .filter((symbol) => !FALLBACK_QUOTES.some((quote) => quote.symbol === symbol))
        .map((symbol) => ({
          symbol,
          price: 0,
          changePercent: 0,
          volume: 0,
          timestamp: new Date().toISOString(),
        }))
    );
  }

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return await fetchAlphaVantageQuote(symbol, apiKey);
      } catch (err) {
        console.error(`Failed to fetch quote for ${symbol}`, err);
        return null;
      }
    })
  );

  const sanitized = quotes.filter((quote): quote is MarketQuote => Boolean(quote));
  return sanitized.length ? sanitized : FALLBACK_QUOTES;
}
