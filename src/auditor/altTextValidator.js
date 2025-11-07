async function validateAltText(page) {
  return await page.evaluate(() => {
    // ALL logic must be inside page.evaluate()
    const images = document.querySelectorAll('img');
    const issues = [];
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const role = img.getAttribute('role');
      
      // Check for missing alt
      if (alt === null && role !== 'presentation') {
        issues.push({
          type: 'missing',
          src: img.src,
          context: img.outerHTML.substring(0, 100)
        });
      }
      
      // Check for empty alt on non-decorative images
      if (alt === '' && img.clientWidth > 50 && img.clientHeight > 50) {
        issues.push({
          type: 'empty_non_decorative',
          src: img.src
        });
      }
      
      // Check for generic alt text
      const generic = ['image', 'photo', 'picture', 'img'];
      if (alt && generic.includes(alt.toLowerCase().trim())) {
        issues.push({
          type: 'generic',
          alt: alt,
          src: img.src
        });
      }
    });
    
    return issues;
  });
}

module.exports = { validateAltText };
