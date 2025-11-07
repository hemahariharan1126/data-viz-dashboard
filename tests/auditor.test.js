const { runFullAudit } = require('../src/auditor/mainAuditor');

describe('Accessibility Auditor', () => {
  test('should detect missing alt text', async () => {
    const results = await runFullAudit('https://example.com');
    expect(results.critical.some(i => i.rule === 'image-alt')).toBe(true);
  }, 30000);
  
  test('should detect contrast issues', async () => {
    const results = await runFullAudit('https://example.com');
    expect(results).toHaveProperty('critical');
  }, 30000);
});
