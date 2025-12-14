"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AuthCard } from "@/components/app/auth-card";
import { useAuthHelpers } from "@/hooks/use-auth-helpers";
import { Suspense } from "react";

export default function SignIn() {
  return (
    <Suspense
      fallback={
        <AuthCard
          mode="sign-in"
          title="Loading sign-in"
          description="Preparing your sign-in form..."
          footerText=""
          footerLinkText=""
          footerHref="/sign-up"
          loading
          onSubmit={async () => undefined}
          onSignInSocialClick={async () => undefined}
          children={undefined}
        />
      }
    >
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const {
    loading,
    signInFields,
    signInStaticFields,
    setSignInFields,
    onSignInEmailSubmit,
    onSignInSocialClick,
    validateSignIn,
  } = useAuthHelpers();

  return (
    <AuthCard
      mode="sign-in"
      title={signInStaticFields.title}
      description={signInStaticFields.description}
      footerText={signInStaticFields.footerText}
      footerLinkText={signInStaticFields.footerLinkText}
      footerHref={signInStaticFields.footerHref}
      loading={loading}
      onSubmit={onSignInEmailSubmit}
      onSignInSocialClick={onSignInSocialClick}
    >
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          onChange={(e) =>
            setSignInFields({ ...signInFields, email: e.target.value })
          }
          value={signInFields.email}
          autoComplete="username"
          disabled={loading}
        />
      </div>

      <div className="grid gap-2">
        <div>
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className={cn(
              "ml-auto inline-block text-xs underline",
              loading && "pointer-events-none opacity-50",
            )}
            aria-disabled={loading}
            tabIndex={loading ? -1 : 0}
          >
            Forgot your password?
          </Link>
        </div>

        <Input
          id="password"
          type="password"
          onChange={(e) =>
            setSignInFields({ ...signInFields, password: e.target.value })
          }
          value={signInFields.password}
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          onClick={() => {
            setSignInFields({
              ...signInFields,
              rememberMe: !signInFields.rememberMe,
            });
          }}
          disabled={loading}
        />
        <Label htmlFor="remember">Remember me</Label>
      </div>

      <Button
        type="submit"
        className={cn("w-full", loading ? "" : "cursor-pointer")}
        disabled={loading || !validateSignIn()}
      >
        <p>Login</p>
      </Button>
    </AuthCard>
  );
}
