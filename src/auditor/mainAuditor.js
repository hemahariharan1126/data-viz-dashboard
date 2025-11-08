const { loadPage } = require('./pageLoader');
const { checkContrasts } = require('./contrastChecker');
const { validateAltText } = require('./altTextValidator');
const { analyzeTabOrder } = require('./tabOrderAnalyzer');
const { validateARIA } = require('./ariaValidator');
const { checkHeadingHierarchy } = require('./headingHierarchy');
const { checkFormAccessibility } = require('./formAccessibility');

async function runFullAudit(url) {
  let browser;
  try {
    console.log('🔍 Starting full audit for:', url);
    const { page, browser: br } = await loadPage(url);
    browser = br;

    // Run all checks in parallel with timeout protection
    console.log('🔄 Running accessibility checks...');
    
    const auditPromise = Promise.all([
      checkContrasts(page).catch(err => { console.error('Contrast check failed:', err); return []; }),
      validateAltText(page).catch(err => { console.error('Alt text check failed:', err); return []; }),
      analyzeTabOrder(page).catch(err => { console.error('Tab order check failed:', err); return { issues: [] }; }),
      validateARIA(page).catch(err => { console.error('ARIA check failed:', err); return []; }),
      checkHeadingHierarchy(page).catch(err => { console.error('Heading check failed:', err); return []; }),
      checkFormAccessibility(page).catch(err => { console.error('Form check failed:', err); return []; })
    ]);

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Audit timeout after 25 seconds')), 25000)
    );

    const [
      contrastIssues,
      altIssues,
      tabIssues,
      ariaIssues,
      headingIssues,
      formIssues
    ] = await Promise.race([auditPromise, timeoutPromise]);

    console.log(`✅ Audit complete:
      - Contrast issues: ${contrastIssues.length}
      - Alt text issues: ${altIssues.length}
      - Tab order issues: ${tabIssues.issues?.length || 0}
      - ARIA issues: ${ariaIssues.length}
      - Heading issues: ${headingIssues.length}
      - Form issues: ${formIssues.length}`);

    await browser.close();

    // Format results
    const critical = [
      ...contrastIssues.map(issue => ({
        rule: 'color-contrast',
        description: `Low contrast: ${issue.text}`,
        help: `Contrast ratio ${issue.ratio}:1, needs ${issue.required}:1`,
        nodes: 1,
        details: [issue]
      })),
      ...altIssues.map(issue => ({
        rule: 'image-alt',
        description: `Image alt text issue: ${issue.type}`,
        help: `${issue.src}`,
        nodes: 1,
        details: [issue]
      })),
      ...ariaIssues.map(issue => ({
        rule: 'aria',
        description: issue.message || (issue.type ? `ARIA issue: ${issue.type}` : 'ARIA issue'),
        help: issue.html || '',
        nodes: 1,
        details: [issue]
      })),
      ...formIssues.map(issue => ({
        rule: 'form',
        description: issue.message || (issue.type ? `Form issue: ${issue.type}` : 'Form accessibility issue'),
        help: issue.html || '',
        nodes: 1,
        details: [issue]
      }))
    ];

    const warnings = [
      ...headingIssues.map(issue => ({
        rule: 'headings',
        description: issue.message || (issue.type ? `Heading issue: ${issue.type}` : 'Heading hierarchy issue'),
        nodes: 1,
        details: [issue]
      })),
      ...(tabIssues.issues || []).map(issue => ({
        rule: 'tab-order',
        description: 'Tab order issue detected',
        nodes: 1,
        details: [issue]
      }))
    ];

    const passed = [{
      rule: 'page-loaded',
      description: 'Page loaded successfully',
      nodes: 1
    }];

    const suggestions = [
      { rule: 'contrast', suggestion: 'Increase text contrast ratios to meet WCAG AA standards (4.5:1)' },
      { rule: 'alt-text', suggestion: 'Add descriptive alt text to all images' },
      { rule: 'keyboard', suggestion: 'Ensure all interactive elements are keyboard accessible' }
    ];

    const summary = {
      criticalCount: critical.length,
      warningCount: warnings.length,
      passedCount: passed.length
    };

    return {
      url,
      timestamp: new Date().toISOString(),
      critical,
      warnings,
      passed,
      suggestions,
      summary
    };

  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    console.error('❌ Audit failed:', error.message);
    throw error;
  }
}

module.exports = { runFullAudit };
