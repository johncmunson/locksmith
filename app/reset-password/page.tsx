"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Loading</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Preparing reset form...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const error = searchParams.get("error") ?? undefined;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  const isDisabled = pending || !password.trim() || !confirm.trim();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    if (!token) {
      toast.error("Missing or invalid token. Request a new link.");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter a new password");
      return;
    }
    if (password.trim() !== confirm.trim()) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setPending(true);
      const { error } = await authClient.resetPassword({
        newPassword: password.trim(),
        token,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Password reset. Please sign in.");
      // Use replace instead of push to avoid navigating back to a used token
      router.replace("/sign-in");
    } finally {
      setPending(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Reset link invalid
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Your reset link is invalid or expired. Request a new one below.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/forgot-password" className="underline">
              Request new reset link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Missing token</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              This page requires a valid reset token. Request a new reset link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/forgot-password" className="underline">
              Back to forgot password
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            Set a new password
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              void onSubmit(e);
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={pending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                disabled={pending}
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              aria-disabled={isDisabled}
              disabled={isDisabled}
            >
              {pending ? "Resetting..." : "Reset password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/sign-in" className="underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
