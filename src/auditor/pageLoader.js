const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

async function loadPage(url) {
  console.log('🌐 Loading page (Optimized & Stabilized):', url);
  
  let browser;
  const maxRetries = 3; // Set a maximum number of retries
  
  // 1. Browser Launch Arguments (Memory & Performance)
  const optimizedArgs = [
    ...chromium.args, 
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage', 
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process', // Reduces memory fragmentation
    '--disable-gpu'
  ];

  // --- START: ETXTBSY Retry Loop (Stability Fix) ---
  for (let i = 0; i < maxRetries; i++) {
    try {
      browser = await puppeteer.launch({
        args: optimizedArgs,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(), // Fixes libnss3.so
        headless: chromium.headless,
      });
      // If launch is successful, exit the retry loop
      break; 
    } catch (error) {
      if (error.message.includes('ETXTBSY') && i < maxRetries - 1) {
        console.warn(`Attempt ${i + 1} failed with ETXTBSY. Retrying in 500ms...`);
        // Wait for a brief period to allow file lock to clear
        await new Promise(resolve => setTimeout(resolve, 500)); 
        continue;
      }
      // If it's the last attempt or a different error, re-throw
      throw error; 
    }
  }
  // --- END: ETXTBSY Retry Loop ---

  // Safety check after retries
  if (!browser) {
    throw new Error("Failed to launch browser after all retries.");
  }

  try {
    const page = await browser.newPage();

    // 2. Speed Optimization: Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'media', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });
    
    // 3. Faster Wait Condition and Timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded', 
      timeout: 15000 
    });
    
    console.log('✅ Page loaded successfully');
    
    return { page, browser };
  } catch (error) {
    // Only close the browser if it was successfully launched
    if (browser) await browser.close(); 
    console.error('Failed to load page or operate on page:', error);
    throw error;
  }
}

module.exports = { loadPage };
