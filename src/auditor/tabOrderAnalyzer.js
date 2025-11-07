async function analyzeTabOrder(page) {
  return await page.evaluate(() => {
    // ALL logic inside page.evaluate()
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const tabOrder = [];
    const issues = [];
    
    focusableElements.forEach((el, index) => {
      const tabIndex = el.getAttribute('tabindex');
      const rect = el.getBoundingClientRect();
      
      tabOrder.push({
        index: index,
        tagName: el.tagName,
        tabIndex: tabIndex || '0',
        position: { top: rect.top, left: rect.left },
        id: el.id,
        class: el.className
      });
      
      // Check for positive tabindex (bad practice)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          type: 'positive_tabindex',
          element: el.outerHTML.substring(0, 100)
        });
      }
    });
    
    return { tabOrder, issues };
  });
}

module.exports = { analyzeTabOrder };
