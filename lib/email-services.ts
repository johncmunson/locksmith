import {
  EmailVerification,
  PasswordReset,
  WelcomeEmail,
} from "@/components/emails";
import { sendEmail } from "@/lib/email";

export interface EmailUser {
  email: string;
  name?: string;
  firstName?: string;
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(user: EmailUser) {
  const firstName = user.firstName ?? user.name ?? "there";

  return await sendEmail({
    to: user.email,
    subject: "Welcome to Locksmith!",
    react: WelcomeEmail({
      firstName,
      email: user.email,
    }),
  });
}

/**
 * Send an email verification email
 */
export async function sendVerificationEmail(
  user: EmailUser,
  verificationUrl: string,
) {
  const firstName = user.firstName ?? user.name ?? "there";

  return await sendEmail({
    to: user.email,
    subject: "Verify your email address",
    react: EmailVerification({
      firstName,
      verificationUrl,
    }),
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  user: EmailUser,
  resetUrl: string,
) {
  const firstName = user.firstName ?? user.name ?? "there";

  return await sendEmail({
    to: user.email,
    subject: "Reset your password",
    react: PasswordReset({
      firstName,
      resetUrl,
    }),
  });
}

/**
 * Send a custom HTML email
 */
export async function sendCustomEmail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  return await sendEmail({
    to,
    subject,
    html,
    text,
    from,
  });
}

/**
 * Send a simple text email
 */
export async function sendTextEmail({
  to,
  subject,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  text: string;
  from?: string;
}) {
  return await sendEmail({
    to,
    subject,
    text,
    from,
  });
}
