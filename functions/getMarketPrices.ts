import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const FINNHUB_API_KEY = Deno.env.get("FINNHUB_API_KEY");
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

// Map symbols to Finnhub quote endpoints
const SYMBOL_MAP = {
  "AAPL": "AAPL",
  "MSFT": "MSFT",
  "NVDA": "NVDA",
  "TSLA": "TSLA",
  "AMZN": "AMZN",
  "XAU": "XAUUSD", // Gold
  "XAG": "XAGUSD", // Silver
  "OIL": "USOIL",  // WTI Oil
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbols } = await req.json();
    const symbolsToFetch = symbols || Object.keys(SYMBOL_MAP);

    const prices = [];

    for (const symbol of symbolsToFetch) {
      const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
      
      try {
        const response = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`
        );
        
        if (!response.ok) {
          console.error(`Failed to fetch ${symbol}:`, response.status);
          continue;
        }

        const data = await response.json();

        if (data && data.c) {
          prices.push({
            symbol: symbol,
            price: data.c,
            change_pct: ((data.c - data.pc) / data.pc * 100).toFixed(2),
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
      }
    }

    return Response.json({ prices });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});