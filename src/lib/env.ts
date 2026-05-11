const requiredServerEnvs = [
  "DATABASE_URL",
  "ADMIN_TOKEN",
];

const secureKeywords = ["SECRET", "PRIVATE", "SERVICE_ROLE", "ADMIN", "STRIPE"];

export function validateEnv() {
  const missing = requiredServerEnvs.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Fatal Error: Missing required secure environment variables: ${missing.join(", ")}`);
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
