import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcrypt";

import { prisma } from "./db";
import { checkRateLimit } from "./rate-limit";
import { headers } from "next/headers";

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
        const forwarded = reqHeaders.get("x-forwarded-for");
        const realIp = reqHeaders.get("x-real-ip");
        const ip = forwarded ? forwarded.split(",")[0].trim() : (realIp || "unknown_ip");

        // Prefix to separate login attempts rate limiting bucket
        const allowed = await checkRateLimit(`login:${ip}`);
        if (!allowed) {
          throw new Error("Too many login attempts. Please try again later.");
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
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-development",
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

