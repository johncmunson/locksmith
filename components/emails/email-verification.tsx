import * as React from "react";

interface EmailVerificationProps {
  firstName: string;
  verificationUrl: string;
}

export function EmailVerification({
  firstName,
  verificationUrl,
}: EmailVerificationProps) {
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
          backgroundColor: "#f8f9fa",
          padding: "32px",
          textAlign: "center" as const,
        }}
      >
        <h1
          style={{ color: "#1f2937", margin: "0 0 16px 0", fontSize: "28px" }}
        >
          Verify Your Email Address
        </h1>
        <p style={{ color: "#6b7280", margin: "0", fontSize: "16px" }}>
          Please confirm your email address to complete your registration.
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
          Thank you for signing up! To complete your registration and start
          using your account, please verify your email address by clicking the
          button below.
        </p>

        <div style={{ textAlign: "center" as const, margin: "32px 0" }}>
          <a
            href={verificationUrl}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              display: "inline-block",
            }}
          >
            Verify Email Address
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
          {verificationUrl}
        </p>

        <p style={{ color: "#ef4444", fontSize: "14px", lineHeight: "1.5" }}>
          This verification link will expire in 24 hours for security reasons.
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
          If you didn&apos;t create this account, please ignore this email or
          contact our support team.
        </p>
      </div>
    </div>
  );
}
