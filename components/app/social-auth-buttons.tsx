"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { MicrosoftIcon } from "@/components/icons/microsoft-icon";

type ProviderId = "google" | "github" | "microsoft";

interface SocialAuthButtonsProps {
  loading: boolean;
  mode: "sign-in" | "sign-up";
  onSignInSocialClick: (providerId: ProviderId) => Promise<void>;
  className?: string;
}

const providers: { id: ProviderId; label: string; icon: React.ReactNode }[] = [
  {
    id: "google",
    label: "Google",
    icon: <GoogleIcon className="size-4" />,
  },
  {
    id: "github",
    label: "GitHub",
    icon: <GithubIcon className="size-4" />,
  },
  {
    id: "microsoft",
    label: "Microsoft",
    icon: <MicrosoftIcon className="size-4" />,
  },
];

export function SocialAuthButtons({
  loading,
  mode,
  onSignInSocialClick,
  className,
}: SocialAuthButtonsProps) {
  const actionVerb = mode === "sign-in" ? "Sign in" : "Sign up";

  return (
    <div className={cn("w-full", className)}>
      <div className="relative mb-5 mt-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        {providers.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="outline"
            className={cn("w-full gap-2", loading ? "" : "cursor-pointer")}
            disabled={loading}
            onClick={() => {
              void onSignInSocialClick(p.id);
            }}
          >
            {p.icon}
            {actionVerb} with {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
