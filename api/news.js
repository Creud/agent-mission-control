// Vercel serverless — RSS news aggregator (Crypto, AI, International, Mexico)
import Parser from 'rss-parser';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // 5min cache

  const feeds = [
    // Crypto
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed' },
    { name: 'TheBlock', url: 'https://www.theblock.co/rss.xml' },
    // AI
    { name: 'AI News', url: 'https://venturebeat.com/category/ai/feed/' },
    // International
    { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'Reuters', url: 'https://www.reutersagency.com/feed/' },
    { name: 'AP News', url: 'https://apnews.com/apf-topnews' },
    // Mexico
    { name: 'El Universal', url: 'https://www.eluniversal.com.mx/rss.xml' },
    { name: 'Milenio', url: 'https://www.milenio.com/rss/portada' },
    { name: 'Reforma', url: 'https://www.reforma.com/rss/portada.xml' },
  ];

  try {
    const parser = new Parser({ timeout: 8000 });
    const results = await Promise.allSettled(
      feeds.map(async (feed) => {
        const parsed = await parser.parseURL(feed.url);
        return parsed.items.slice(0, 5).map(item => ({
          source: feed.name,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate || item.isoDate,
        }));
      })
    );

    const items = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 20);

    res.json({ items, updated: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
