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
    // Phase 1: Run the Audit (Already Optimized in mainAuditor)
    const results = await runFullAudit(url);
    
    // Phase 2: Generate HTML Content
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Accessibility Report for ${url}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2em; }
            h1 { color: #667eea; }
            .section { margin-bottom: 2em; }
            pre { 
                  background: #f8f8f8; 
                  padding: 1em; 
                  border-radius: 0.5em; 
                  /* Optimization: Ensure pre tags don't cause huge lines */
                  white-space: pre-wrap;
                  word-wrap: break-word;
              }
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

    // Phase 3: Launch Browser and Generate PDF
    const optimizedArgs = [
        ...chromium.args, 
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Essential for Vercel/low memory
        '--single-process', // Memory optimization
    ];
    
    const browser = await puppeteer.launch({
      args: optimizedArgs, // Use optimized args
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    let page;
    try {
        page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded' }); // Use faster wait condition
        
        // Use shorter dimensions for PDF printing to save memory/time
        const pdfBuffer = await page.pdf({ 
            format: 'A4', 
            printBackground: true, 
            timeout: 10000 // Set a specific timeout for the PDF operation
        });
        
        await browser.close();

        // Phase 4: Send Response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="accessibility-report.pdf"');
        res.send(pdfBuffer);
    } catch (e) {
        // Ensure the browser is closed even if PDF generation fails
        if (browser) await browser.close();
        throw e;
    }
    
  } catch (err) {
    console.error('PDF Export Error:', err);
    res.status(500).json({ error: err.message });
  }
};
