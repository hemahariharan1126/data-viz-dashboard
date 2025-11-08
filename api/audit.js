const { runFullAudit } = require('../src/auditor/mainAuditor');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // Validation
  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'URL is required and must be a string'
    });
  }

  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid URL format',
      message: 'URL must be a valid web address (e.g., https://example.com)'
    });
  }

  try {
    const results = await runFullAudit(url);
    res.json(results);
  } catch (error) {
    console.error('Audit failed:', error);
    res.status(500).json({
      error: 'Audit failed',
      message: error.message
    });
  }
};
