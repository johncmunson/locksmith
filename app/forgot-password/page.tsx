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
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || submitted) return;
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    try {
      setPending(true);
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const url = new URL(`${basePath}/reset-password`, window.location.origin);
      await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: url.toString(),
      });
    } catch (err) {
      console.error("requestPasswordReset failed", err);
    } finally {
      setSubmitted(true);
      setPending(false);
      toast.success("If an account exists, we sent a reset link.");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Forgot password</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Enter your email and we&apos;ll send you a reset link.
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={pending || submitted}
                autoComplete="username"
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              aria-disabled={pending || submitted || !email.trim()}
              disabled={pending || submitted || !email.trim()}
            >
              {pending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm">
            Remembered your password?{" "}
            <Link href="/sign-in" className="underline">
              Back to sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
