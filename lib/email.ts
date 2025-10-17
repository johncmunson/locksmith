import { type CreateEmailOptions, Resend } from "resend";

const nodeEnv = process.env.NODE_ENV as string;
const resendApiKey = process.env.RESEND_API_KEY as string;
const defaultFrom = process.env.RESEND_DEFAULT_FROM as string;

const isProd = nodeEnv === "production";

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Initialize Resend
export const resend = new Resend(resendApiKey);

// Email configuration
export const emailConfig = {
  // Default from address - should be updated to use your verified domain in prod
  defaultFrom,
  // Test email addresses for development
  testEmails: {
    delivered: "delivered@resend.dev",
    bounced: "bounced@resend.dev",
    complained: "complained@resend.dev",
  },
};

// Helper function to get recipient email for development
export function getTestEmailRecipient(
  originalEmail: string,
  testType: "delivered" | "bounced" | "complained" = "delivered",
): string {
  if (!isProd) {
    // In development, use test emails with label to track the original recipient
    const label = originalEmail.replace(/[^a-zA-Z0-9]/g, "-");
    return `${testType}+${label}@resend.dev`;
  }
  return originalEmail;
}

// Email sending function with error handling
export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  from = emailConfig.defaultFrom,
  testType = "delivered",
}: {
  to: string | string[];
  subject: string;
  react?: React.ReactElement;
  html?: string;
  text?: string;
  from?: string;
  testType?: "delivered" | "bounced" | "complained";
}) {
  try {
    // Convert to array if single email
    const recipients = Array.isArray(to) ? to : [to];

    // In development, use test email addresses
    const testRecipients = isProd
      ? recipients
      : recipients.map((email) => getTestEmailRecipient(email, testType));

    // Build email data object with proper content
    const baseEmailData = {
      from,
      to: testRecipients,
      subject: isProd ? subject : `[DEV] ${subject}`,
    };

    // Add content based on what's provided
    let emailData: MakeOptional<CreateEmailOptions, "react" | "html" | "text"> =
      baseEmailData;

    if (react) {
      emailData = { ...baseEmailData, react };
    } else if (html) {
      emailData = { ...baseEmailData, html, text: text ?? "" };
    } else if (text) {
      emailData = { ...baseEmailData, text };
    } else {
      // Default fallback
      emailData = {
        ...baseEmailData,
        text: "This email was sent without content.",
      };
    }

    const { data, error } = await resend.emails.send(
      emailData as CreateEmailOptions,
    );

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error };
    }

    // console.log("Email sent successfully:", {
    //   id: data?.id,
    //   to: testRecipients,
    //   subject: emailData.subject,
    //   isProd,
    // })

    return { success: true, data };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}
