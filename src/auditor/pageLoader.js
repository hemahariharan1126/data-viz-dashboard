const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

async function loadPage(url) {
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });
  
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  return { page, browser };
}

module.exports = { loadPage };
