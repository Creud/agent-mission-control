// api/prices.js — CoinGecko (BTC/ETH/SOL) + DexScreener (Solana tokens)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=25, stale-while-revalidate=10');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const SOLANA_TOKENS = {
    SKR:     'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3',
    FARTCOIN:'9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    GBOY:    'svy5ErijNYy9hEVzxknCdwWdZ3NeXJTdpb9Ndnso17f',
    NOBODY:  'C29ebrgYjYoJPMGPnPSGY1q3mMGk4iDSqnQeQQA7moon',
  };

  try {
    // Fetch CoinGecko + DexScreener in parallel
    const mints = Object.values(SOLANA_TOKENS).join(',');
    const [cgRes, dexRes] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true', {
        headers: { 'User-Agent': 'mission-control/1.0' }
      }),
      fetch(`https://api.dexscreener.com/tokens/v1/solana/${mints}`, {
        headers: { 'User-Agent': 'mission-control/1.0' }
      })
    ]);

    const [cgData, dexData] = await Promise.all([cgRes.json(), dexRes.json()]);

    // Build result from CoinGecko
    const out = {
      SOL: { price: cgData.solana?.usd ?? null, change24h: cgData.solana?.usd_24h_change ?? null },
      BTC: { price: cgData.bitcoin?.usd ?? null, change24h: cgData.bitcoin?.usd_24h_change ?? null },
      ETH: { price: cgData.ethereum?.usd ?? null, change24h: cgData.ethereum?.usd_24h_change ?? null },
    };

    // Build result from DexScreener — pick best pair (highest liquidity) per token
    const bestPair = {};
    if (Array.isArray(dexData)) {
      for (const pair of dexData) {
        const mint = pair.baseToken?.address;
        if (!mint) continue;
        const sym = Object.keys(SOLANA_TOKENS).find(k => SOLANA_TOKENS[k] === mint);
        if (!sym) continue;
        const liq = parseFloat(pair.liquidity?.usd || 0);
        if (!bestPair[sym] || liq > bestPair[sym].liq) {
          bestPair[sym] = {
            price: parseFloat(pair.priceUsd) || null,
            change24h: pair.priceChange?.h24 ?? null,
            liq
          };
        }
      }
    }

    for (const sym of Object.keys(SOLANA_TOKENS)) {
      out[sym] = bestPair[sym]
        ? { price: bestPair[sym].price, change24h: bestPair[sym].change24h }
        : { price: null, change24h: null };
    }

    return res.json(out);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
