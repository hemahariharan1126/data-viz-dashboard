const puppeteer = require('puppeteer');

async function loadPage(url) {
  let browser;
  try {
    console.log('🚀 Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'  // For Windows/low memory systems
      ]
    });
    
    console.log('📄 Creating new page...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });
    
    console.log(`🌐 Loading URL: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully');
    return { page, browser };
  } catch (error) {
    if (browser) await browser.close();
    console.error('❌ Error loading page:', error.message);
    throw error;
  }
}

module.exports = { loadPage };
