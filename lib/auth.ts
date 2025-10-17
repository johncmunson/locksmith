import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { afterHook } from "@/lib/auth-request-hooks";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/email-services";

const githubClientId = process.env.GITHUB_CLIENT_ID!;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET!;
const microsoftClientId = process.env.MICROSOFT_CLIENT_ID!;
const microsoftClientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET!;

export const auth = betterAuth({
  appName: "Locksmith",
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    transaction: true,
    // Uncomment if you want to automatically log SQL queries in non-prod environments
    // debugLogs: process.env.NODE_ENV !== "production",
  }),
  hooks: {
    after: afterHook,
  },
  advanced: {
    database: {
      generateId: false,
      useNumberId: true,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    updateAccountOnSignIn: true,
    accountLinking: {
      enabled: true,
      // Enforce same-email linking only. If a user tries to link an account with a different
      // email, better-auth will reject the link attempt. Additionally, it's smart enough to
      // not create an entirely new user account if the emails don't match. We wouldn't want
      // accidental new user accounts to be created automatically through social linking.
      allowDifferentEmails: false,
      trustedProviders: ["email-password", "google", "github", "microsoft"],
    },
  },
  emailAndPassword: {
    enabled: true,
    // Allow the user to login and use the app without verifying their email.
    // We will require email verification for anything requiring payment or subscription.
    requireEmailVerification: false,
    // Automatically sign in the user after sign up
    autoSignIn: true,
    // Send an email to the user with a link to reset their password
    sendResetPassword: async (data, _request) => {
      // Prefer the URL provided by Better Auth (respects client-supplied redirectTo),
      // and fallback to constructing from env if unavailable.
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL;
      const fallbackUrl = `${baseUrl}/reset-password?token=${data.token}`;
      const url = data.url ?? fallbackUrl;

      const result = await sendPasswordResetEmail(
        { email: data.user.email, name: data.user.name },
        url,
      );

      if (!result.success) {
        console.error("Failed to send password reset email:", result.error);
        throw new Error("Failed to send password reset email");
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Send an email to the user with the verification link
      const result = await sendVerificationEmail(
        { email: user.email, name: user.name },
        url,
      );

      if (!result.success) {
        console.error("Failed to send verification email:", result.error);
        throw new Error("Failed to send verification email");
      }
    },
  },
  socialProviders: {
    google: {
      // Google allows passing the "prompt" param to control whether to
      // re-select the account every time. This can help prevent accidental
      // sign-ins, sign-ups, or account linking with the wrong account.
      // prompt: "select_account",
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    },
    microsoft: {
      // See notes for Google above. Microsoft also supports the "prompt" param.
      // prompt: "select_account",
      clientId: microsoftClientId,
      clientSecret: microsoftClientSecret,
    },
  },
  // make sure that nextCookies() comes last in the array
  plugins: [nextCookies()],
});
