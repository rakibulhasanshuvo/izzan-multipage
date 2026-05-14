const fs = require('fs');

let ordersRouteTest = fs.readFileSync('src/app/api/orders/route.test.ts', 'utf8');
ordersRouteTest = ordersRouteTest.replace(/<<<<<<<[\s\S]*?=======\n/g, '');
ordersRouteTest = ordersRouteTest.replace(/>>>>>>> main\n/g, '');
ordersRouteTest = ordersRouteTest.replace(/findMany: vi\.fn\(\)\.mockResolvedValue\(\[\{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 \}\]\),\n          findMany: vi\.fn\(\)\.mockResolvedValue\(\[\{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 \}\]\),/g, "findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),");
ordersRouteTest = ordersRouteTest.replace(/findMany: vi\.fn\(\)\.mockResolvedValue\(\[\]\),\n          findMany: vi\.fn\(\)\.mockResolvedValue\(\[\]\),/g, "findMany: vi.fn().mockResolvedValue([]),");
fs.writeFileSync('src/app/api/orders/route.test.ts', ordersRouteTest);

let productsRouteTest = fs.readFileSync('src/app/api/admin/products/route.test.ts', 'utf8');
productsRouteTest = productsRouteTest.replace(/<<<<<<<[\s\S]*?=======\n/g, '');
productsRouteTest = productsRouteTest.replace(/>>>>>>> main\n/g, '');
fs.writeFileSync('src/app/api/admin/products/route.test.ts', productsRouteTest);

let apiTs = fs.readFileSync('src/lib/api.ts', 'utf8');
apiTs = apiTs.replace('import { logger } from "@/lib/logger";\n', '');
fs.writeFileSync('src/lib/api.ts', apiTs);
