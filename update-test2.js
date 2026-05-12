const fs = require('fs');

let content = fs.readFileSync('src/app/api/orders/route.test.ts', 'utf8');

content = content.replace(/txMock = {\n\s*product: {\n\s*findMany: vi\.fn\(\)\.mockResolvedValue\(\[\]\),\n\s*\/\/ Mock product not found\n\s*findUnique: vi\.fn\(\)\.mockResolvedValue\(null\),/g, `txMock = {\n        product: {\n          findMany: vi.fn().mockResolvedValue([]),\n          // Mock product not found\n          findUnique: vi.fn().mockResolvedValue(null),\n          findFirst: vi.fn().mockResolvedValue(null),`);

fs.writeFileSync('src/app/api/orders/route.test.ts', content);
