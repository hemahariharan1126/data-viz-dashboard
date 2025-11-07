function formatResults(axeResults, contrastIssues, altIssues, tabIssues) {
  const critical = [];
  const warnings = [];
  const passed = [];
  const suggestions = [];
  
  // Process axe violations
  axeResults.violations.forEach(violation => {
    if (violation.impact === 'critical' || violation.impact === 'serious') {
      critical.push({
        rule: violation.id,
        description: violation.description,
        help: violation.help,
        nodes: violation.nodes.length,
        details: violation.nodes.map(node => ({
          html: node.html,
          target: node.target,
          message: node.failureSummary
        }))
      });
    } else {
      warnings.push({
        rule: violation.id,
        description: violation.description,
        nodes: violation.nodes.length
      });
    }
  });
  
  // Add contrast issues
  if (contrastIssues.length > 0) {
    critical.push({
      rule: 'color-contrast',
      description: `${contrastIssues.length} elements with insufficient contrast`,
      details: contrastIssues
    });
  }
  
  // Add alt text issues
  if (altIssues.length > 0) {
    critical.push({
      rule: 'image-alt',
      description: `${altIssues.length} images with alt text issues`,
      details: altIssues
    });
  }
  
  // Process passed checks
  axeResults.passes.forEach(pass => {
    passed.push({
      rule: pass.id,
      description: pass.description,
      nodes: pass.nodes.length
    });
  });
  
  // Generate suggestions
  critical.forEach(issue => {
    suggestions.push(generateSuggestion(issue));
  });
  
  return {
    critical,
    warnings,
    passed,
    suggestions,
    summary: {
      criticalCount: critical.length,
      warningCount: warnings.length,
      passedCount: passed.length
    }
  };
}

function generateSuggestion(issue) {
  const suggestionMap = {
    'color-contrast': 'Increase contrast ratio by darkening text or lightening background',
    'image-alt': 'Add descriptive alt text: <img src="..." alt="Description of image">',
    'label': 'Wrap inputs with labels: <label>Name <input type="text"></label>',
    'heading-order': 'Ensure heading levels increment by one (h1 → h2 → h3)'
  };
  
  return {
    rule: issue.rule,
    suggestion: suggestionMap[issue.rule] || issue.help
  };
}

module.exports = { formatResults };
