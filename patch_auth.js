const fs = require('fs');
let code = fs.readFileSync('src/lib/auth.ts', 'utf8');

const search = `<<<<<<< fix-patch-test-suite-5250918837225607534
export function verifyToken(token?: string): boolean {
  if (!token) return false;
  return token === process.env.ADMIN_TOKEN;
=======


/**
 * Verifies a token against the expected admin token.
 */
export function verifyToken(token?: string): boolean {
  if (!token) return false;
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    console.error("ADMIN_TOKEN is not configured");
    return false;
  }
  return token === expectedToken;
>>>>>>> main`;

const replace = `/**
 * Verifies a token against the expected admin token.
 */
export function verifyToken(token?: string): boolean {
  if (!token) return false;
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    console.error("ADMIN_TOKEN is not configured");
    return false;
  }
  return token === expectedToken;`;

code = code.replace(search, replace);
fs.writeFileSync('src/lib/auth.ts', code);
