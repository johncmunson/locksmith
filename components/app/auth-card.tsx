import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { SocialAuthButtons } from "@/components/app/social-auth-buttons";

interface AuthCardProps {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
  title: string;
  description: string;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  onSignInSocialClick: (
    providerId: "google" | "github" | "microsoft",
  ) => Promise<void>;
}

export function AuthCard({
  children,
  mode,
  title,
  description,
  footerText,
  footerLinkText,
  footerHref,
  loading,
  onSubmit,
  onSignInSocialClick,
}: AuthCardProps) {
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          {loading ? (
            <Loader2
              aria-label="Loading"
              className="h-4 w-4 animate-spin text-muted-foreground"
            />
          ) : null}
        </div>
        <CardDescription className="text-xs md:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            void onSubmit(e);
          }}
        >
          {children}
          <SocialAuthButtons
            loading={loading}
            mode={mode}
            onSignInSocialClick={onSignInSocialClick}
          />
        </form>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm">
          {footerText}{" "}
          <Link
            href={footerHref}
            className={`underline ${loading ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={loading}
            tabIndex={loading ? -1 : 0}
          >
            {footerLinkText}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
