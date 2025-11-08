const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
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
        <head>
          <meta charset="UTF-8">
          <title>Accessibility Report for ${url}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2em; }
            h1 { color: #667eea; }
            .section { margin-bottom: 2em; }
            pre { background: #f8f8f8; padding: 1em; border-radius: 0.5em; }
            .stat { font-weight: bold; margin-bottom: 1em; }
          </style>
        </head>
        <body>
          <h1>Accessibility Report</h1>
          <div class="stat">URL: ${url}</div>
          <div class="stat">Audit at: ${results.timestamp}</div>
          <div class="section">
            <h2>Summary</h2>
            <pre>${JSON.stringify(results.summary, null, 2)}</pre>
          </div>
          <div class="section">
            <h2>Critical Issues</h2>
            <pre>${JSON.stringify(results.critical, null, 2)}</pre>
          </div>
          <div class="section">
            <h2>Warnings</h2>
            <pre>${JSON.stringify(results.warnings, null, 2)}</pre>
          </div>
          <div class="section">
            <h2>Suggestions</h2>
            <pre>${JSON.stringify(results.suggestions, null, 2)}</pre>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="accessibility-report.pdf"');
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF Export Error:', err);
    res.status(500).json({ error: err.message });
  }
};
