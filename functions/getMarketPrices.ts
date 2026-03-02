import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ALPHA_VANTAGE_API_KEY = Deno.env.get("ALPHA_VANTAGE_API_KEY");
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Map symbols to Alpha Vantage quote endpoints
const SYMBOL_MAP = {
  "AAPL": "AAPL",
  "MSFT": "MSFT",
  "NVDA": "NVDA",
  "TSLA": "TSLA",
  "AMZN": "AMZN",
  "XAU": "GC=F",
  "XAG": "SI=F",
  "OIL": "CL=F",
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

    // Fetch stocks and commodities from Alpha Vantage
     for (const symbol of symbolsToFetch) {
       if (CRYPTO_MAP[symbol]) continue; // Skip cryptos, handle separately

       const avSymbol = SYMBOL_MAP[symbol] || symbol;

       try {
         const response = await fetch(
           `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${avSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
         );

         if (!response.ok) continue;

         const data = await response.json();

         if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
           const quote = data["Global Quote"];
           const price = parseFloat(quote["05. price"]);
           const changePct = parseFloat(quote["10. change percent"]) || 0;

           prices.push({
             symbol: symbol,
             price: price,
             change_pct: changePct,
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