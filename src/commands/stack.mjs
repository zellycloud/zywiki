/**
 * stack.mjs
 * Show detected tech stack details
 */

import fs from 'fs';
import path from 'path';
import { getPaths, loadConfig } from '../core/metadata.mjs';
import { getTechStack, generateTechStackMarkdown } from '../core/detector.mjs';

/**
 * Stack command - show detected tech stack
 */
export async function stackCommand(options = {}) {
  const techStack = await getTechStack();
  const { root } = getPaths();
  const config = loadConfig();

  console.log('\nTech Stack Analysis');
  console.log('===================\n');

  // Languages section
  if (techStack.languages.length > 0) {
    console.log('[Languages]');
    const total = techStack.languages.reduce((sum, l) => sum + l.count, 0);
    for (const lang of techStack.languages.slice(0, 8)) {
      const percent = ((lang.count / total) * 100).toFixed(1);
      const barFilled = Math.round(percent / 5);
      const bar = '#'.repeat(barFilled) + '-'.repeat(20 - barFilled);
      console.log(`   ${lang.name.padEnd(12)} [${bar}] ${percent}% (${lang.count} files)`);
    }
    console.log('');
  }

  // Frameworks section
  if (techStack.summary.totalFrameworks > 0) {
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

    for (const [category, items] of Object.entries(techStack.frameworks)) {
      const name = categoryNames[category] || category;
      console.log(`   ${name}:`);
      for (const item of items) {
        console.log(`      - ${item.name}: ${item.description}`);
      }
    }
    console.log('');
  }

  // Services section
  if (techStack.summary.totalServices > 0) {
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

    for (const [category, items] of Object.entries(techStack.services)) {
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
  console.log(`   Primary Language: ${techStack.summary.primaryLanguage}`);
  console.log(`   Total Frameworks: ${techStack.summary.totalFrameworks}`);
  console.log(`   Total Services:   ${techStack.summary.totalServices}`);

  // Generate markdown if requested
  if (options.output || options.save) {
    const docsDir = path.join(root, config.docsDir);
    const outputPath = options.output || path.join(docsDir, 'architecture', 'tech-stack.md');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const markdown = generateTechStackMarkdown(techStack);
    fs.writeFileSync(outputPath, markdown);
    console.log(`\nTech stack documentation saved to: ${outputPath}`);
  }

  console.log('');
}
