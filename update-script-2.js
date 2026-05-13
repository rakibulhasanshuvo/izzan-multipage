const fs = require('fs');

let content = fs.readFileSync('src/app/api/orders/route.ts', 'utf8');

// I also need to update the fallback name-based lookup
content = content.replace(/if \(!dbProduct && item\.name\) \{\n\s*\/\/ Fallback to name-based lookup if ID changed across DB resets\n\s*dbProduct = await tx\.product\.findFirst\(\{\n\s*where: \{ name: item\.name \}\n\s*\}\);\n\s*\}/g, `if (!dbProduct && item.name) {
          // Fallback to name-based lookup if ID changed across DB resets
          // Look up in our pre-fetched map
          dbProduct = Array.from(productMap.values()).find(p => p.name === item.name);

          if (!dbProduct) {
             // Fallback to DB query only if not pre-fetched
             dbProduct = await tx.product.findFirst({
               where: { name: item.name }
             });
             if (dbProduct) {
                productMap.set(dbProduct.id, dbProduct);
                stockTracker.set(dbProduct.id, dbProduct.stock);
             }
          }
        }`);

fs.writeFileSync('src/app/api/orders/route.ts', content);
