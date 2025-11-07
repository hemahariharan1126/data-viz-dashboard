async function checkHeadingHierarchy(page) {
  return await page.evaluate(() => {
    const issues = [];
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0, h1Count = 0;
    headings.forEach((h, idx) => {
      const level = parseInt(h.tagName.substr(1));
      if (level === 1) h1Count++;
      if (idx > 0 && level > lastLevel + 1) {
        issues.push({ type: 'skipped-level', html: h.outerHTML, message: `Skipped from h${lastLevel} to h${level}` });
      }
      lastLevel = level;
    });
    if (h1Count !== 1) {
      issues.push({ type: 'h1-count', message: `Should have exactly one h1, found ${h1Count}` });
    }
    return issues;
  });
}
module.exports = { checkHeadingHierarchy };
