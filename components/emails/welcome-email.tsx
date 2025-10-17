import * as React from "react";

interface WelcomeEmailProps {
  firstName: string;
  email: string;
}

export function WelcomeEmail({ firstName, email }: WelcomeEmailProps) {
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
          Welcome to Locksmith!
        </h1>
        <p style={{ color: "#6b7280", margin: "0", fontSize: "16px" }}>
          We&apos;re excited to have you on board.
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
          Thank you for signing up! Your account has been created successfully
          with the email address <strong>{email}</strong>.
        </p>

        <p style={{ color: "#1f2937", fontSize: "16px", lineHeight: "1.6" }}>
          You can now start exploring all the features we have to offer. If you
          have any questions or need assistance, don&apos;t hesitate to reach
          out to our support team.
        </p>

        <div style={{ textAlign: "center" as const, margin: "32px 0" }}>
          <a
            href={process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}
            style={{
              backgroundColor: "#3b82f6",
              color: "white",
              padding: "12px 24px",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              display: "inline-block",
            }}
          >
            Get Started
          </a>
        </div>

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
