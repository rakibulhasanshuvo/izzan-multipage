const fs = require('fs');

let content = fs.readFileSync('src/app/api/orders/route.ts', 'utf8');
content = content.replace(/let dbProduct = await tx.product.findUnique\(\{\n          where: \{ id: item.id \}\n        \}\);/g, "let dbProduct = productMap.get(item.id);");
content = content.replace(/where: \{ id: dbProduct.id \}/g, "where: { id: productId }");
content = content.replace(/data: \{ stock: \{ decrement: item.quantity \} \}/g, "data: { stock: { decrement: quantity } }");

fs.writeFileSync('src/app/api/orders/route.ts', content);
