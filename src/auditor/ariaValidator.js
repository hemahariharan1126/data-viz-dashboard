async function validateARIA(page) {
  return await page.evaluate(() => {
    const results = [];
    document.querySelectorAll('[role]').forEach(el => {
      const role = el.getAttribute('role');
      const allowed = ['button', 'navigation', 'main', 'region', 'banner', 'complementary'];
      if (!allowed.includes(role)) {
        results.push({ type: 'invalid-role', role, html: el.outerHTML.substring(0,100) });
      }
      if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
        results.push({ type: 'missing-aria-label', role, html: el.outerHTML.substring(0,100) });
      }
    });
    return results;
  });
}
module.exports = { validateARIA };
