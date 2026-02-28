// Vercel serverless — price proxy using Jupiter + CoinGecko
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30');

  try {
    // CoinGecko: SOL, BTC, ETH
    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
      { headers: { 'User-Agent': 'steffan-mc/1.0' } }
    );
    const cg = await cgRes.json();

    // Jupiter Price v2: SKR, GBOY, NOBODY (Solana tokens)
    const mints = [
      'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3', // SKR
      'svy5ErijNYy9hEVzxknCdwWdZ3NeXJTdpb9Ndnso17f',  // GBOY
      'C29ebrgYjYoJPMGPnPSGY1q3mMGk4iDSqnQeQQA7moon', // NOBODY
    ];
    let jup = {};
    try {
      const jupRes = await fetch(
        `https://api.jup.ag/price/v2?ids=${mints.join(',')}`,
        { headers: { 'User-Agent': 'steffan-mc/1.0' } }
      );
      const jupData = await jupRes.json();
      jup = jupData?.data ?? {};
    } catch (_) {}

    const getJup = (mint) => {
      const d = jup[mint];
      return d ? parseFloat(d.price) : null;
    };

    const skrPrice  = getJup('SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3');
    const gboyPrice = getJup('svy5ErijNYy9hEVzxknCdwWdZ3NeXJTdpb9Ndnso17f');
    const nobodyPrice = getJup('C29ebrgYjYoJPMGPnPSGY1q3mMGk4iDSqnQeQQA7moon');

    res.json({
      SOL:      { price: cg.solana?.usd ?? null,    change24h: cg.solana?.usd_24h_change ?? null },
      BTC:      { price: cg.bitcoin?.usd ?? null,   change24h: cg.bitcoin?.usd_24h_change ?? null },
      ETH:      { price: cg.ethereum?.usd ?? null,  change24h: cg.ethereum?.usd_24h_change ?? null },
      SKR:      { price: skrPrice,                   change24h: null },
      GBOY:     { price: gboyPrice,                  change24h: null },
      NOBODY:   { price: nobodyPrice,                change24h: null },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
