const axe = require('axe-core');
const { resolve } = require('path');

const PATH_TO_AXE = './node_modules/axe-core/axe.min.js';

async function runAxeAudit(page, options = {}) {
  // Inject axe-core script into the page
  await page.addScriptTag({ path: resolve(PATH_TO_AXE) });
  
  // Run axe accessibility checks
  const results = await page.evaluate((axeOptions) => {
    return new Promise((resolve) => {
      setTimeout(resolve, 0);
    }).then(() => axe.run(axeOptions));
  }, options);
  
  return results;
}


// In src/auditor/axeRunner.js
const axe = require('axe-core');

async function runAxeAudit(page) {
  await page.addScriptTag({ path: require.resolve('axe-core') });
  return await page.evaluate(() => axe.run());
}
module.exports = { runAxeAudit };