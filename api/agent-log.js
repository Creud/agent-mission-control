// Vercel serverless — Agent log (OpenClaw session messages)
// Reads recent session history and returns formatted log entries

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=10'); // 10s cache

  // OpenClaw Gateway URL from env or default to localhost
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
  const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN;

  if (!gatewayToken) {
    return res.status(500).json({ 
      error: 'OPENCLAW_GATEWAY_TOKEN not configured',
      entries: []
    });
  }

  try {
    // Fetch recent sessions
    const sessionsRes = await fetch(`${gatewayUrl}/api/sessions`, {
      headers: {
        'Authorization': `Bearer ${gatewayToken}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!sessionsRes.ok) {
      throw new Error(`Gateway sessions API returned ${sessionsRes.status}`);
    }

    const sessions = await sessionsRes.json();
    
    // Get the most recent main session
    const mainSession = sessions.sessions?.find(s => s.agentId === 'main') || sessions.sessions?.[0];
    
    if (!mainSession) {
      return res.json({ entries: [], updated: new Date().toISOString() });
    }

    // Fetch history for that session
    const historyRes = await fetch(
      `${gatewayUrl}/api/sessions/${mainSession.sessionKey}/history?limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${gatewayToken}`,
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!historyRes.ok) {
      throw new Error(`Gateway history API returned ${historyRes.status}`);
    }

    const history = await historyRes.json();

    // Format log entries
    const entries = (history.messages || [])
      .filter(msg => msg.role === 'assistant' || msg.role === 'user')
      .slice(-20)
      .reverse()
      .map(msg => ({
        timestamp: msg.timestamp || new Date().toISOString(),
        role: msg.role,
        content: typeof msg.content === 'string' 
          ? msg.content.substring(0, 200) 
          : JSON.stringify(msg.content).substring(0, 200),
      }));

    res.json({ 
      entries, 
      sessionKey: mainSession.sessionKey,
      updated: new Date().toISOString() 
    });

  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      entries: []
    });
  }
}
