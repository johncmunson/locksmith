import * as React from "react";

interface PasswordResetProps {
  firstName: string;
  resetUrl: string;
}

export function PasswordReset({ firstName, resetUrl }: PasswordResetProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#fef3c7",
          padding: "32px",
          textAlign: "center" as const,
        }}
      >
        <h1
          style={{ color: "#92400e", margin: "0 0 16px 0", fontSize: "28px" }}
        >
          Reset Your Password
        </h1>
        <p style={{ color: "#d97706", margin: "0", fontSize: "16px" }}>
          We received a request to reset your password.
        </p>
      </div>

      <div style={{ padding: "32px" }}>
        <p
          style={{
            color: "#1f2937",
            fontSize: "16px",
            lineHeight: "1.6",
            marginTop: "0",
          }}
        >
          Hi {firstName},
        </p>

        <p style={{ color: "#1f2937", fontSize: "16px", lineHeight: "1.6" }}>
          Someone requested a password reset for your account. If this was you,
          click the button below to create a new password. If you didn&apos;t
          request this, you can safely ignore this email.
        </p>

        <div style={{ textAlign: "center" as const, margin: "32px 0" }}>
          <a
            href={resetUrl}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              display: "inline-block",
            }}
          >
            Reset Password
          </a>
        </div>

        <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.5" }}>
          If the button doesn&apos;t work, you can copy and paste the following
          link into your browser:
        </p>

        <p
          style={{
            color: "#3b82f6",
            fontSize: "14px",
            wordBreak: "break-all" as const,
            backgroundColor: "#f3f4f6",
            padding: "12px",
            borderRadius: "4px",
            fontFamily: "monospace",
          }}
        >
          {resetUrl}
        </p>

        <p style={{ color: "#ef4444", fontSize: "14px", lineHeight: "1.5" }}>
          This password reset link will expire in 1 hour for security reasons.
        </p>

        <p
          style={{
            color: "#6b7280",
            fontSize: "14px",
            lineHeight: "1.5",
            marginBottom: "0",
          }}
        >
          Best regards,
          <br />
          The Locksmith Team
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "24px",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <p
          style={{
            color: "#9ca3af",
            fontSize: "12px",
            textAlign: "center" as const,
            margin: "0",
          }}
        >
          If you didn&apos;t request this password reset, please ignore this
          email or contact our support team if you have concerns.
        </p>
      </div>
    </div>
  );
}
