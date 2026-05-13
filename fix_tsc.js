const fs = require('fs');

let dbTs = fs.readFileSync('src/lib/db.ts', 'utf8');
dbTs = dbTs.replace('import { logger } from "@/lib/logger";\n', '');
fs.writeFileSync('src/lib/db.ts', dbTs);

let loginPage = fs.readFileSync('src/app/admin/login/page.tsx', 'utf8');
loginPage = loginPage.replace('import { logger } from "@/lib/logger";', 'import logger from "@/lib/logger";');
fs.writeFileSync('src/app/admin/login/page.tsx', loginPage);

let cmsManagement = fs.readFileSync('src/components/admin/CMSManagement.tsx', 'utf8');
cmsManagement = cmsManagement.replace('import { logger } from "@/lib/logger";', 'import logger from "@/lib/logger";');
fs.writeFileSync('src/components/admin/CMSManagement.tsx', cmsManagement);

let ordersTable = fs.readFileSync('src/components/admin/OrdersTableClient.tsx', 'utf8');
ordersTable = ordersTable.replace('import { logger } from "@/lib/logger";', 'import logger from "@/lib/logger";');
fs.writeFileSync('src/components/admin/OrdersTableClient.tsx', ordersTable);

let productManagement = fs.readFileSync('src/components/admin/ProductManagement.tsx', 'utf8');
productManagement = productManagement.replace('import { logger } from "@/lib/logger";', 'import logger from "@/lib/logger";');
fs.writeFileSync('src/components/admin/ProductManagement.tsx', productManagement);

let settingsForm = fs.readFileSync('src/components/admin/SettingsFormClient.tsx', 'utf8');
settingsForm = settingsForm.replace('import { logger } from "@/lib/logger";', 'import logger from "@/lib/logger";');
fs.writeFileSync('src/components/admin/SettingsFormClient.tsx', settingsForm);

let cartContext = fs.readFileSync('src/context/CartContext.tsx', 'utf8');
cartContext = cartContext.replace('import { logger } from "@/lib/logger";', 'import logger from "@/lib/logger";');
fs.writeFileSync('src/context/CartContext.tsx', cartContext);

let ordersRoute = fs.readFileSync('src/app/api/orders/route.ts', 'utf8');
ordersRoute = ordersRoute.replace('dbProduct = await tx.product.findFirst({', 'dbProduct = (await tx.product.findFirst({');
ordersRoute = ordersRoute.replace('             if (dbProduct) {', '             })) || undefined;\n             if (dbProduct) {');
fs.writeFileSync('src/app/api/orders/route.ts', ordersRoute);
