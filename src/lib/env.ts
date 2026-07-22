const requiredServerEnvs = [
  "ADMIN_TOKEN",
  "NEXTAUTH_SECRET",
];

const secureKeywords = ["SECRET", "PRIVATE", "SERVICE_ROLE", "ADMIN", "STRIPE"];

// Known placeholder prefixes that should never be used in production
const PLACEHOLDER_PATTERNS = [
  "replace_me",
  "your-",
  "changeme",
  "fallback-",
  "insecure",
  "placeholder",
  "todo",
  "xxx",
];

export function validateEnv() {
  if (process.env.npm_lifecycle_event === "build" || process.env.NEXT_PHASE === "phase-production-build") return;

  const missing = requiredServerEnvs.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Fatal Error: Missing required secure environment variables: ${missing.join(", ")}`);
  }

  // In production, reject placeholder values for sensitive env vars
  if (process.env.NODE_ENV === "production") {
    for (const key of requiredServerEnvs) {
      const value = process.env[key];
      if (value) {
        const lowerValue = value.toLowerCase();
        const isPlaceholder = PLACEHOLDER_PATTERNS.some((pattern) => lowerValue.startsWith(pattern) || lowerValue.includes(pattern));
        if (isPlaceholder) {
          throw new Error(`Fatal Error: Environment variable "${key}" contains a placeholder value. Set a real secret before deploying.`);
        }
      }
    }
  }

  for (const key of Object.keys(process.env)) {
    if (key.startsWith("NEXT_PUBLIC_")) {
      const isSensitive = secureKeywords.some((keyword) => key.toUpperCase().includes(keyword));
      if (isSensitive) {
        throw new Error(`Fatal Error: Secure environment variable leaked to client bundle: ${key}`);
      }
    }
  }
}

// ensure env variables are validated at startup
validateEnv();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
};
