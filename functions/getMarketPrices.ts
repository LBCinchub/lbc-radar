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
  "XAU": "XAUUSD",
  "XAG": "XAGUSD",
  "OIL": "USOIL",
};

// Cryptocurrency IDs for CoinGecko
const CRYPTO_MAP = {
  "BTC": "bitcoin",
  "ETH": "ethereum",
  "XRP": "ripple",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbols } = await req.json();
    const symbolsToFetch = symbols || Object.keys(SYMBOL_MAP).concat(Object.keys(CRYPTO_MAP));

    const prices = [];

    // Fetch stocks and commodities from Finnhub
    for (const symbol of symbolsToFetch) {
      if (CRYPTO_MAP[symbol]) continue; // Skip cryptos, handle separately

      const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
      
      try {
        const response = await fetch(
          `${FINNHUB_BASE_URL}/quote?symbol=${finnhubSymbol}&token=${FINNHUB_API_KEY}`
        );
        
        if (!response.ok) continue;

        const data = await response.json();

        if (data && data.c) {
          prices.push({
            symbol: symbol,
            price: data.c,
            change_pct: (data.c - data.pc) / data.pc * 100,
            type: 'stock',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
      }
    }

    // Fetch cryptocurrencies from CoinGecko (free API)
    const cryptoSymbols = symbolsToFetch.filter(s => CRYPTO_MAP[s]);
    if (cryptoSymbols.length > 0) {
      try {
        const ids = cryptoSymbols.map(s => CRYPTO_MAP[s]).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );

        if (response.ok) {
          const cryptoData = await response.json();
          
          for (const symbol of cryptoSymbols) {
            const cryptoId = CRYPTO_MAP[symbol];
            if (cryptoData[cryptoId]) {
              prices.push({
                symbol: symbol,
                price: cryptoData[cryptoId].usd,
                change_pct: cryptoData[cryptoId].usd_24h_change || 0,
                type: 'crypto',
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error.message);
      }
    }

    return Response.json({ prices, timestamp: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});