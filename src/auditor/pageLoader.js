const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function loadPage(url) {
  console.log('🌐 Loading page:', url);
  
  let browser;
  
  try {
    // Launch browser with serverless-compatible settings
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 25000  // Reduced timeout for serverless
    });
    
    console.log('✅ Page loaded successfully');
    
    return { page, browser };
  } catch (error) {
    if (browser) await browser.close();
    console.error('Failed to load page:', error);
    throw error;
  }
}

module.exports = { loadPage };

