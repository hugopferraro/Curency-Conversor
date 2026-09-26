import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";

import { db } from "@/db/client";
import { authSchema } from "@/db/schema";

const trustedOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  appName: "Conversor de Moedas",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            name: "User",
            email: user.email.trim().toLowerCase(),
            image: null,
          },
        }),
      },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
    },
  },
  trustedOrigins,
  disabledPaths: [
    "/update-user",
    "/change-email",
    "/change-password",
    "/set-password",
    "/delete-user",
    "/request-password-reset",
    "/reset-password",
    "/send-verification-email",
    "/verify-email",
    "/link-social",
    "/unlink-account",
  ],
  advanced: {
    database: { generateId: "uuid" },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  telemetry: { enabled: false },
});
