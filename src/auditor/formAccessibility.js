async function checkFormAccessibility(page) {
  return await page.evaluate(() => {
    const issues = [];
    document.querySelectorAll('input, select, textarea').forEach(input => {
      let labelled = false;
      const id = input.id;
      if (id && document.querySelector(`label[for='${id}']`)) labelled = true;
      if (input.closest('label')) labelled = true;
      if (input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby')) labelled = true;
      if (!labelled) issues.push({
        type: 'unlabeled-input',
        html: input.outerHTML
      });
    });
    return issues;
  });
}
module.exports = { checkFormAccessibility };
