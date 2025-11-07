const { Command } = require('commander');
const chalk = require('chalk');
const { runFullAudit } = require('../auditor/mainAuditor');
const fs = require('fs');

const program = new Command();

program
  .name('accessibility-auditor')
  .description('Check websites for accessibility issues')
  .version('1.0.0');

program
  .command('audit')
  .description('Run accessibility audit on a URL')
  .argument('<url>', 'URL to audit')
  .option('-o, --output <file>', 'Save results to JSON file')
  .option('-f, --format <type>', 'Output format (json|html)', 'json')
  .action(async (url, options) => {
    console.log(chalk.blue(`Auditing ${url}...\n`));
    
    try {
      const results = await runFullAudit(url);
      
      // Console output
      console.log(chalk.red.bold(`\n🔴 Critical Issues: ${results.summary.criticalCount}`));
      results.critical.forEach(issue => {
        console.log(chalk.red(`  - ${issue.description}`));
      });
      
      console.log(chalk.yellow.bold(`\n🟡 Warnings: ${results.summary.warningCount}`));
      results.warnings.forEach(issue => {
        console.log(chalk.yellow(`  - ${issue.description}`));
      });
      
      console.log(chalk.green.bold(`\n🟢 Passed: ${results.summary.passedCount}`));
      
      // Save to file if specified
      if (options.output) {
        fs.writeFileSync(
          options.output, 
          JSON.stringify(results, null, 2)
        );
        console.log(chalk.blue(`\nResults saved to ${options.output}`));
      }
      
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();
