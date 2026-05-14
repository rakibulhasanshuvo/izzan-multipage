const fs = require('fs');
let code = fs.readFileSync('src/lib/api.test.ts', 'utf8');

const mock = `
vi.mock('@/lib/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() }
}));
`;

if (!code.includes("vi.mock('@/lib/logger'")) {
  code = code.replace("describe('apiHandler', () => {", mock + "\ndescribe('apiHandler', () => {");
  fs.writeFileSync('src/lib/api.test.ts', code);
}
