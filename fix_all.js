const fs = require('fs');

const files = [
  'src/app/api/orders/route.test.ts',
  'src/app/api/admin/products/route.test.ts',
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Quick regex to strip git conflict markers and keep the main branch version
  // We'll replace the whole conflict block with the bottom version (main)
  const regex = /<<<<<<<[^=]+=======\r?\n([\s\S]*?)>>>>>>> [^\r\n]+/g;
  code = code.replace(regex, '$1');

  fs.writeFileSync(file, code);
}
