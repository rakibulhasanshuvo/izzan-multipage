import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Root-level config files only — a bare "*.js" would silently exclude
    // every .js file repo-wide from linting.
    "/*.js",
    "coverage/**",
    "src/generated/**",
    "audits/**",
  ]),
]);

export default eslintConfig;
