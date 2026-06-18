import { execSync } from 'child_process';
import fs from 'fs';

const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/shop',
  'http://localhost:3000/story',
  'http://localhost:3000/contact',
  'http://localhost:3000/admin/login'
];

urls.forEach(url => {
  const filename = url.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
  console.log(`Auditing ${url}...`);
  try {
    execSync(`npx lighthouse "${url}" --preset=desktop --only-categories=performance --output=json --output-path="./${filename}" --chrome-flags="--headless"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to audit ${url}:`, err);
  }
});
