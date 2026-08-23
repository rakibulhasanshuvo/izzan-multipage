import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';

let sampleProductId = 'cmt59dhtx0000jm7oedi29zod';
try {
  const db = new Database('./prisma/dev.db');
  const row = db.prepare('SELECT id FROM Product LIMIT 1').get();
  if (row?.id) sampleProductId = row.id;
} catch (e) {
  // fallback
}

const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/shop',
  `http://localhost:3000/product/${sampleProductId}`,
  'http://localhost:3000/story',
  'http://localhost:3000/contact',
  'http://localhost:3000/admin/login'
];

const auditDir = './audits';
if (!fs.existsSync(auditDir)) {
  fs.mkdirSync(auditDir, { recursive: true });
}

console.log('\n======================================================');
console.log('  STARTING FULL MULTI-CATEGORY LIGHTHOUSE AUDIT');
console.log('======================================================\n');

const results = [];

for (const url of urls) {
  const filename = url.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
  const outputPath = path.join(auditDir, filename);
  console.log(`Auditing ${url} across all categories...`);
  
  try {
    execSync(
      `npx --yes lighthouse "${url}" --preset=desktop --output=json --output-path="${outputPath}" --chrome-flags="--headless=new --no-sandbox --window-size=1350,900" --no-enable-error-reporting`,
      { stdio: 'pipe' }
    );
    
    if (fs.existsSync(outputPath)) {
      const data = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      const scores = {
        url,
        performance: data.categories.performance ? Math.round(data.categories.performance.score * 100) : 'N/A',
        accessibility: data.categories.accessibility ? Math.round(data.categories.accessibility.score * 100) : 'N/A',
        bestPractices: data.categories['best-practices'] ? Math.round(data.categories['best-practices'].score * 100) : 'N/A',
        seo: data.categories.seo ? Math.round(data.categories.seo.score * 100) : 'N/A'
      };
      results.push(scores);
      console.log(`  ✓ Performance: ${scores.performance} | Accessibility: ${scores.accessibility} | Best Practices: ${scores.bestPractices} | SEO: ${scores.seo}`);
    }
  } catch (err) {
    console.error(`  ✗ Failed to audit ${url}:`, err.message);
  }
}

console.log('\n======================================================');
console.log('  FINAL AUDIT SCORECARD ACROSS ALL CATEGORIES');
console.log('======================================================\n');
console.table(results);

