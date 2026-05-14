const fs = require('fs');
let code = fs.readFileSync('src/lib/api.ts', 'utf8');

const search = `import logger from "@/lib/logger";
import { Prisma } from "@/generated/client";
import { logger } from "@/lib/logger";`;

const replace = `import { Prisma } from "@/generated/client";
import { logger } from "@/lib/logger";`;

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/lib/api.ts', code);
}
