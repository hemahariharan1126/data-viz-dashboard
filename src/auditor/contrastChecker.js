async function checkContrasts(page) {
  return await page.evaluate(() => {
    // IMPORTANT: These functions MUST be inside page.evaluate()
    
    function getLuminance(rgbString) {
      if (!rgbString || rgbString === 'rgba(0, 0, 0, 0)' || rgbString === 'transparent') {
        return 1;
      }
      
      const match = rgbString.match(/\d+/g);
      if (!match || match.length < 3) {
        return 1;
      }
      
      const [r, g, b] = match.slice(0, 3).map(Number).map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    function calculateContrastRatio(color1, color2) {
      const l1 = getLuminance(color1);
      const l2 = getLuminance(color2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }
    
    function getEffectiveBackgroundColor(element) {
      let el = element;
      let bgColor = window.getComputedStyle(el).backgroundColor;
      
      while ((!bgColor || bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') && el.parentElement) {
        el = el.parentElement;
        bgColor = window.getComputedStyle(el).backgroundColor;
      }
      
      return bgColor || 'rgb(255, 255, 255)';
    }
    
    // Main logic
    const violations = [];
    const checkedElements = new Set();
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button, label, li, td, th');
    
    textElements.forEach(el => {
      try {
        const text = el.textContent?.trim();
        if (!text || text.length === 0) return;
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return;
        }
        
        const color = style.color;
        const bgColor = getEffectiveBackgroundColor(el);
        
        if (!color || !bgColor) return;
        
        const ratio = calculateContrastRatio(color, bgColor);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight) || 400;
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
        const requiredRatio = isLargeText ? 3.0 : 4.5;
        
        if (ratio < requiredRatio) {
          const elementKey = `${el.tagName}-${color}-${bgColor}`;
          if (!checkedElements.has(elementKey)) {
            checkedElements.add(elementKey);
            
            violations.push({
              element: el.tagName.toLowerCase(),
              text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
              color: color,
              backgroundColor: bgColor,
              ratio: parseFloat(ratio.toFixed(2)),
              required: requiredRatio,
              location: el.className || el.id || 'no-identifier',
              fontSize: fontSize + 'px',
              fontWeight: fontWeight
            });
          }
        }
      } catch (error) {
        console.error('Error checking element:', error);
      }
    });
    
    return violations;
  });
}

module.exports = { checkContrasts };
