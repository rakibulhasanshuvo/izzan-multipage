const fs = require('fs');
let content = fs.readFileSync('src/app/api/orders/route.ts', 'utf8');

content = content.replace(`             dbProduct = (await tx.product.findFirst({
               where: { name: item.name }
             });
             })) || undefined;
             if (dbProduct) {`, `             dbProduct = (await tx.product.findFirst({
               where: { name: item.name }
             })) || undefined;
             if (dbProduct) {`);

fs.writeFileSync('src/app/api/orders/route.ts', content);
