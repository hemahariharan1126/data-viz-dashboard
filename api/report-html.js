const { runFullAudit } = require('../src/auditor/mainAuditor');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const results = await runFullAudit(url);
    const html = `
      <html>
        <head><title>Accessibility Report</title></head>
        <body>
          <h1>Accessibility Report for ${url}</h1>
          <pre>${JSON.stringify(results, null, 2)}</pre>
        </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename="accessibility-report.html"');
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

