const fs = require('fs');

const file = 'src/app/api/orders/route.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace productMap with a map we create from dbProducts
const replacement = `const productMap = new Map(dbProducts.map(p => [p.id, p]));`;
code = code.replace("const stockTracker = new Map(dbProducts.map(p => [p.id, p.stock]));", replacement + "\n      const stockTracker = new Map(dbProducts.map(p => [p.id, p.stock]));");

fs.writeFileSync(file, code);
