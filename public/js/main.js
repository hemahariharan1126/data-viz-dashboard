document.getElementById('auditBtn').addEventListener('click', runAudit);

async function runAudit() {
  const urlInput = document.getElementById('urlInput').value.trim();
  
  // Validation: Check if URL is empty
  if (!urlInput) {
    alert('❌ Please enter a URL');
    return;
  }
  
  // Validation: Check if URL has protocol
  let url = urlInput;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;  // Add https:// by default
  }
  
  // Validation: Check if URL is valid
  try {
    new URL(url);  // This will throw if URL is invalid
  } catch (error) {
    alert('❌ Invalid URL: ' + error.message);
    return;
  }
  
  showLoading();
  
  try {
    console.log('📤 Sending audit request for:', url);
    const response = await fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }
    
    const results = await response.json();
    console.log('✅ Received results:', results);
    
    // Safety checks
    if (!results || typeof results !== 'object') {
      throw new Error('Invalid response format');
    }
    
    results.critical = results.critical || [];
    results.warnings = results.warnings || [];
    results.passed = results.passed || [];
    results.suggestions = results.suggestions || [];
    results.summary = results.summary || {
      criticalCount: 0,
      warningCount: 0,
      passedCount: 0
    };
    
    displayResults(results);
    
  } catch (error) {
    console.error('❌ Audit error:', error);
    alert('❌ Audit failed: ' + error.message + '\n\nTip: Make sure the URL is valid (e.g., https://example.com)');
  } finally {
    hideLoading();
  }
}

function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.classList.remove('hidden');
  
  const criticalCount = results.summary?.criticalCount ?? 0;
  const warningCount = results.summary?.warningCount ?? 0;
  const passedCount = results.summary?.passedCount ?? 0;
  
  // Display summary
  document.querySelector('.summary').innerHTML = `
    <h2>✅ Audit Results</h2>
    <div class="stat-cards">
      <div class="stat critical">${criticalCount} Critical</div>
      <div class="stat warning">${warningCount} Warnings</div>
      <div class="stat passed">${passedCount} Passed</div>
    </div>
  `;
  
  // Display critical issues
  const criticalHTML = (results.critical || []).length > 0
    ? results.critical.map(issue => `
        <div class="issue-card critical">
          <h3>${issue.description || 'Issue'}</h3>
          <p>${issue.help || ''}</p>
          <details>
            <summary>View details</summary>
            <pre>${JSON.stringify(issue.details, null, 2)}</pre>
          </details>
        </div>
      `).join('')
    : '<p>✅ No critical issues found!</p>';
  
  document.querySelector('.critical-section').innerHTML = `
    <h2>🔴 Critical Issues</h2>
    ${criticalHTML}
  `;
  
  // Display warnings
  const warningsHTML = (results.warnings || []).length > 0
    ? results.warnings.map(issue => `
        <div class="issue-card warning">
          <h3>${issue.description || 'Warning'}</h3>
        </div>
      `).join('')
    : '<p>✅ No warnings found!</p>';
  
  document.querySelector('.warnings-section').innerHTML = `
    <h2>🟡 Warnings</h2>
    ${warningsHTML}
  `;
  
  // Display passed checks
  const passedHTML = (results.passed || []).length > 0
    ? results.passed.map(issue => `
        <div class="issue-card passed">
          <h3>✓ ${issue.description || 'Check passed'}</h3>
        </div>
      `).join('')
    : '<p>No passed checks</p>';
  
  document.querySelector('.passed-section').innerHTML = `
    <h2>🟢 Passed Checks</h2>
    ${passedHTML}
  `;
  
  // Display suggestions
  const suggestionsHTML = (results.suggestions || []).length > 0
    ? results.suggestions.map(s => `
        <div class="suggestion">
          <strong>💡 ${s.rule}:</strong> ${s.suggestion}
        </div>
      `).join('')
    : '<p>No suggestions available</p>';
  
  document.querySelector('.suggestions-section').innerHTML = `
    <h2>💡 Suggestions</h2>
    ${suggestionsHTML}
  `;
}

function showLoading() {
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden');
}
document.getElementById('colorBlindBtn').onclick = () => {
  // Toggle class on body or container
  document.body.classList.toggle('simulate-protanopia');
  // Optionally update button text/state
  const isActive = document.body.classList.contains('simulate-protanopia');
  document.getElementById('colorBlindBtn').innerText = isActive ? 'Stop Simulating' : 'Simulate Protanopia';
};

document.getElementById('pdfExportBtn').onclick = async () => {
  const url = document.getElementById('urlInput').value.trim();
  const response = await fetch('/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (response.ok) {
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'accessibility-report.pdf';
    link.click();
  } else {
    alert('PDF export failed!');
  }
};

document.getElementById('htmlExportBtn').onclick = async () => {
  const url = document.getElementById('urlInput').value.trim();
  const response = await fetch('/api/report/html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (response.ok) {
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'accessibility-report.html';
    link.click();
  } else {
    alert('HTML export failed!');
  }
};
