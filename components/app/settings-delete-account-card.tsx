"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { authClient } from "@/lib/auth-client";

async function mockDeleteAccount(): Promise<void> {
  // Simulate API latency and random failure
  await new Promise((r) => setTimeout(r, 1200));
  const fail = Math.random() < 0.25;
  if (fail) {
    throw new Error("Mock delete failed");
  }
}

export function SettingsDeleteAccountCard() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Keep dialog open while we "delete"
    e.preventDefault();
    setLoading(true);
    try {
      await mockDeleteAccount();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
          },
        },
      });
      // No need to manually close; navigation will unmount this component
    } catch {
      setOpen(false);
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="pb-0 border-destructive/30">
      <CardHeader>
        <CardTitle className="text-xl">Delete Account</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          Once you delete your account, there is no going back. Please be
          certain.
        </CardDescription>
      </CardHeader>
      <CardFooter className="bg-destructive/10 border-t border-destructive/30 min-h-16 !py-4">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="ml-auto cursor-pointer bg-destructive/50"
            >
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer" disabled={loading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer"
                disabled={loading}
                onClick={(e) => {
                  void onConfirm(e);
                }}
              >
                {loading && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
