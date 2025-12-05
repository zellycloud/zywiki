/**
 * stack.mjs
 * Show detected tech stack details
 */

import fs from 'fs';
import path from 'path';
import { getPaths, loadConfig } from '../core/metadata.mjs';
import { getTechStack, generateTechStackMarkdown } from '../core/detector.mjs';
import { output } from '../core/output.mjs';

/**
 * Collect stack data
 */
async function collectStackData() {
  const techStack = await getTechStack();

  // Calculate percentages for languages
  const total = techStack.languages.reduce((sum, l) => sum + l.count, 0);
  const languages = techStack.languages.slice(0, 8).map(lang => ({
    name: lang.name,
    count: lang.count,
    percentage: total > 0 ? parseFloat(((lang.count / total) * 100).toFixed(1)) : 0,
  }));

  return {
    success: true,
    languages,
    frameworks: techStack.frameworks,
    services: techStack.services,
    summary: {
      primaryLanguage: techStack.summary.primaryLanguage,
      totalFrameworks: techStack.summary.totalFrameworks,
      totalServices: techStack.summary.totalServices,
    },
  };
}

/**
 * Format stack data as text
 */
function formatStackText(data, options = {}) {
  console.log('\nTech Stack Analysis');
  console.log('===================\n');

  // Languages section
  if (data.languages.length > 0) {
    console.log('[Languages]');
    for (const lang of data.languages) {
      const barFilled = Math.round(lang.percentage / 5);
      const bar = '#'.repeat(barFilled) + '-'.repeat(20 - barFilled);
      console.log(`   ${lang.name.padEnd(12)} [${bar}] ${lang.percentage}% (${lang.count} files)`);
    }
    console.log('');
  }

  // Frameworks section
  if (data.summary.totalFrameworks > 0) {
    console.log('[Frameworks & Libraries]');

    const categoryNames = {
      frontend: 'Frontend',
      backend: 'Backend',
      mobile: 'Mobile',
      build: 'Build Tools',
      testing: 'Testing',
      state: 'State Management',
      database: 'Database/ORM',
      ui: 'UI Libraries',
      forms: 'Form Libraries',
      validation: 'Validation',
    };

    for (const [category, items] of Object.entries(data.frameworks)) {
      const name = categoryNames[category] || category;
      console.log(`   ${name}:`);
      for (const item of items) {
        console.log(`      - ${item.name}: ${item.description}`);
      }
    }
    console.log('');
  }

  // Services section
  if (data.summary.totalServices > 0) {
    console.log('[Services & Integrations]');

    const categoryNames = {
      database: 'Database Services',
      auth: 'Authentication',
      payment: 'Payment',
      hosting: 'Hosting & Cloud',
      ai: 'AI/ML',
      analytics: 'Analytics',
      monitoring: 'Monitoring',
      communication: 'Communication',
      cms: 'Content Management',
      storage: 'File Storage',
      search: 'Search',
      queue: 'Queue/Background Jobs',
      realtime: 'Real-time',
      features: 'Feature Flags',
      scheduling: 'Scheduling',
    };

    for (const [category, items] of Object.entries(data.services)) {
      const name = categoryNames[category] || category;
      console.log(`   ${name}:`);
      for (const item of items) {
        console.log(`      - ${item.name}: ${item.description}`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('[Summary]');
  console.log(`   Primary Language: ${data.summary.primaryLanguage}`);
  console.log(`   Total Frameworks: ${data.summary.totalFrameworks}`);
  console.log(`   Total Services:   ${data.summary.totalServices}`);
  console.log('');
}

/**
 * Stack command - show detected tech stack
 */
export async function stackCommand(options = {}) {
  const data = await collectStackData();
  const { root } = getPaths();
  const config = loadConfig();

  // JSON output mode
  if (options.json) {
    output(data, options, () => {});
    return;
  }

  // Text output mode
  formatStackText(data);

  // Generate markdown if requested
  if (options.output || options.save) {
    const techStack = await getTechStack();
    const docsDir = path.join(root, config.docsDir);
    const outputPath = options.output || path.join(docsDir, 'architecture', 'tech-stack.md');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const markdown = generateTechStackMarkdown(techStack);
    fs.writeFileSync(outputPath, markdown);
    console.log(`Tech stack documentation saved to: ${outputPath}`);
  }
}
