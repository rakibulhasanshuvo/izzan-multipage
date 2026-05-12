const fs = require('fs');

let content = fs.readFileSync('package.json', 'utf8');
content = content.replace(/"test": "vitest run",/g, `"test": "node --experimental-strip-types --test src/app/api/admin/products/route.test.ts && vitest run src/app/api/orders/route.test.ts",`);

fs.writeFileSync('package.json', content);
