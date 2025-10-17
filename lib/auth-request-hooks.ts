import { db } from "@/db";
import { accounts, sessions, users } from "@/db/schema";
import { createAuthMiddleware } from "better-auth/api";
import { and, eq, isNotNull } from "drizzle-orm";

/**
 * Email auto-verification after OAuth sign-in/link
 * ------------------------------------------------
 *
 * Better Auth defaults
 * - When a user initially signs up using an OAuth provider (e.g., Google/Microsoft), the
 *   provider typically asserts a verified email, and Better Auth will create the user with
 *   emailVerified=true by default.
 * - However, if a user first signs up with Email/Password (emailVerified=false until they
 *   click the verification link) and later signs in with, or manually links, an OAuth
 *   provider, Better Auth does not automatically flip emailVerified to true. In practice,
 *   there's no reason not to trust the email at that point, since the OAuth provider has
 *   already verified it. We consider this default behavior lacking.
 *
 * What we do here
 * - We implement a small "after" hook that runs after the OAuth callback. If the user has at
 *   least one OAuth account that supplies an ID token (OIDC), which implicitly carries an
 *   email verification guarantee, we set users.emailVerified = true. This enables the
 *   "link social → trust email" flow described above, regardless of whether the user
 *   originally signed up with OAuth or if they added it later.
 *
 * Provider differences
 * - Works with providers that return an ID token (e.g., Google, Microsoft) because these are
 *   OIDC providers that include the verification semantics we rely on.
 * - Does not run for providers that don’t return an ID token by default (e.g., GitHub). Those
 *   require calling the provider’s API to confirm a primary+verified email, which we’re not
 *   doing here to keep the logic minimal.
 *
 * Fallback when we can’t auto-verify
 * - If no ID-token-capable account is linked, we leave emailVerified as-is (potentially
 *   false for Email/Password signups). That’s acceptable... the user can still click "resend
 *   verification email" and complete verification through the standard email flow.
 *
 * Control flow (high level)
 * 1) Only act on /callback/* routes (OAuth callback).
 * 2) Resolve the userId from the newly created session (sign-in/up) or the existing session
 *    cookie (manual link).
 * 3) Query the user’s accounts to see if any has a non-null idToken (i.e., OIDC provider).
 * 4) If such an account exists, set users.emailVerified = true.
 * 5) Otherwise, do nothing - the verification state remains unchanged.
 *
 * Note: Better Auth’s default account-linking configuration requires matching emails (unless
 *       explicitly configured otherwise). That means we don’t need to manually re-check email
 *       equality here. If the account linked, the emails already match.
 *
 * Note: If this after-hook becomes a maintenance burden for any reason, we can always safely
 *       remove it with minimal risk. The worst case is that users who link an OAuth provider
 *       after signing up with Email/Password will still need to verify their email via the
 *       standard email verification flow.
 */
export const afterHook = createAuthMiddleware(async (ctx) => {
  try {
    if (!ctx.path?.startsWith("/callback/")) return;

    // Resolve user id from new session (sign-in/up) or existing session (linking)
    let userIdNum: number | null = null;
    const newSession = ctx.context.newSession;
    if (
      newSession?.user?.id != null &&
      Number.isFinite(Number(newSession.user.id))
    ) {
      userIdNum = Number(newSession.user.id);
    } else {
      const cookieName = ctx.context.authCookies?.sessionToken?.name;
      const token = cookieName ? ctx.getCookie(cookieName) : undefined;
      if (token) {
        const s = await db
          .select({ userId: sessions.userId })
          .from(sessions)
          .where(eq(sessions.token, token))
          .limit(1)
          .then((r) => r[0]);
        if (s?.userId != null) userIdNum = s.userId;
      }
    }

    if (userIdNum == null) return;

    // Only set email_verified to true if there exists at least one account with a non-null idToken
    const hasIdTokenAccount: boolean = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.userId, userIdNum), isNotNull(accounts.idToken)))
      .limit(1)
      .then((rows) => rows.length > 0);

    if (!hasIdTokenAccount) return;

    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, userIdNum));
  } catch {
    // Ignore errors in this non-critical path
    console.error("Error occurred while updating email verification status");
  }
});
