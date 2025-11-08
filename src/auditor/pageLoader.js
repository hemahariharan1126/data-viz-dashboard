const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function loadPage(url) {
  console.log('🌐 Loading page:', url);
  
  let browser;
  
  // Check if running in serverless environment (Vercel)
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  
  if (isServerless) {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // Local development - use regular puppeteer
    const puppeteerRegular = require('puppeteer');
    browser = await puppeteerRegular.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  const page = await browser.newPage();
  
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  console.log('✅ Page loaded successfully');
  
  return { page, browser };
}

module.exports = { loadPage };
