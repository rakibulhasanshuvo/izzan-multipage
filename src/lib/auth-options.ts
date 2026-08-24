import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcrypt";

import { prisma } from "./db";
import { checkRateLimit, getClientIpFromHeaders, MAX_LOGIN_ATTEMPTS } from "./rate-limit";
import { headers } from "next/headers";

/**
 * Resolved lazily (via the getter on authOptions) so that builds never
 * require secrets: page-data collection imports this module, and CI/Vercel
 * build environments legitimately have no NEXTAUTH_SECRET. At request time
 * a missing secret in production still fails fast.
 */
const BUILD_PLACEHOLDER_SECRET = "nextauth-build-placeholder-not-used-at-runtime";

function resolveSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.warn("⚠️ NEXTAUTH_SECRET is not set during build; using a placeholder. Configure it in your deployment environment.");
    return BUILD_PLACEHOLDER_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("Fatal: NEXTAUTH_SECRET is required in production. Generate one with: openssl rand -base64 32");
  }
  console.warn("⚠️ NEXTAUTH_SECRET is not set. Using insecure dev-only fallback. Do NOT deploy like this.");
  return "insecure-dev-only-do-not-deploy";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Get IP address from headers during the authentication request on server
        const reqHeaders = await headers();
        const ip = getClientIpFromHeaders(reqHeaders);

        // Prefix to separate login attempts rate limiting bucket (strict limit)
        const allowed = await checkRateLimit(`login:${ip}`, MAX_LOGIN_ATTEMPTS);
        if (!allowed) {
          // In NextAuth v4 the thrown message is forwarded verbatim to the
          // client via the ?error= query param (see core/routes/callback.js);
          // returning null instead yields the generic "CredentialsSignin".
          throw new Error("Too many login attempts. Please try again later.");
        }

        // Per-account throttle: stops distributed brute-force attacks that
        // rotate IPs but target a single username.
        const usernameAllowed = await checkRateLimit(
          `login:user:${credentials.username.trim().toLowerCase()}`,
          MAX_LOGIN_ATTEMPTS
        );
        if (!usernameAllowed) {
          throw new Error("Too many login attempts for this account. Please try again later.");
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username }
        });

        if (!admin) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: admin.id,
          name: admin.username,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  get secret() {
    return resolveSecret();
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
      }
      return session;
    }
  }
};

