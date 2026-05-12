const fs = require('fs');

let content = fs.readFileSync('src/app/api/orders/route.test.ts', 'utf8');

content = content.replace(/txMock = {\n\s*product: {\n\s*findUnique/g, `txMock = {\n        product: {\n          findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),\n          findUnique`);
content = content.replace(/txMock = {\n\s*product: {\n\s*\/\/ Mock product not found\n\s*findUnique: vi\.fn\(\)\.mockResolvedValue\(null\),/g, `txMock = {\n        product: {\n          findMany: vi.fn().mockResolvedValue([]),\n          // Mock product not found\n          findUnique: vi.fn().mockResolvedValue(null),`);
content = content.replace(/txMock = {\n\s*product: {\n\s*\/\/ Mock stock 10 \(less than 20 requested\)\n\s*findUnique: vi\.fn\(\)\.mockResolvedValue\({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }\),/g, `txMock = {\n        product: {\n          findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),\n          // Mock stock 10 (less than 20 requested)\n          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),`);

fs.writeFileSync('src/app/api/orders/route.test.ts', content);
