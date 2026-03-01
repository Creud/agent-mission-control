export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.json({
    online: true,
    activity: 'monitoring',
    agent: 'Steffan',
    version: '1.4.1',
    updatedAt: new Date().toISOString()
  });
}
