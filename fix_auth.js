const fs = require('fs');

let code = fs.readFileSync('src/lib/auth.ts', 'utf8');

// The original conflict block
const conflict = `<<<<<<< fix-patch-test-suite-5250918837225607534
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

const replacement = `/**
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

fs.writeFileSync('src/lib/auth.ts', fs.readFileSync('src/lib/auth.ts', 'utf8').replace(conflict, replacement));
