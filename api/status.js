// Vercel serverless — Pedro status (API health + current activity)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=5'); // 5s cache

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

  if (!gatewayToken) {
    return res.json({ 
      online: false,
      activity: 'offline',
      error: 'no_token'
    });
  }

  try {
    // Probe gateway health
    const healthRes = await fetch(`${gatewayUrl}/api/health`, {
      headers: { 'Authorization': `Bearer ${gatewayToken}` },
      signal: AbortSignal.timeout(3000),
    });

    if (!healthRes.ok) throw new Error('gateway_down');

    // Fetch recent session activity
    const sessionsRes = await fetch(`${gatewayUrl}/api/sessions?limit=1`, {
      headers: { 'Authorization': `Bearer ${gatewayToken}` },
      signal: AbortSignal.timeout(3000),
    });

    if (!sessionsRes.ok) throw new Error('sessions_api_failed');

    const sessions = await sessionsRes.json();
    const mainSession = sessions.sessions?.[0];
    
    // Determine activity from last message timestamp
    let activity = 'idle';
    if (mainSession?.lastMessageAt) {
      const lastMsg = new Date(mainSession.lastMessageAt);
      const ageSeconds = (Date.now() - lastMsg) / 1000;
      
      if (ageSeconds < 30) activity = 'active';
      else if (ageSeconds < 300) activity = 'thinking';
      else if (ageSeconds < 3600) activity = 'idle';
      else activity = 'resting';
    }

    res.json({ 
      online: true,
      activity,
      lastSeen: mainSession?.lastMessageAt || null
    });

  } catch (err) {
    res.json({ 
      online: false,
      activity: 'offline',
      error: err.message
    });
  }
}
