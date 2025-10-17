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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SettingsDisplayNameCard() {
  const {
    data: session,
    isPending,
    error: _err,
    refetch,
  } = authClient.useSession();

  // Track the initial value independently so we can compute "edited" state
  const initialValueRef = useRef<string | null>(null);
  const [value, setValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from session once
  useEffect(() => {
    if (session?.user?.name != null && initialValueRef.current == null) {
      initialValueRef.current = session.user.name;
      setValue(session.user.name);
    }
  }, [session]);

  const isEdited =
    initialValueRef.current != null && value !== initialValueRef.current;
  const isEmpty = value.trim().length === 0;
  const isTooLong = value.trim().length > 32;
  const disableSave =
    isSaving || isPending || !isEdited || isEmpty || isTooLong;

  async function handleSave() {
    if (disableSave) return;
    setIsSaving(true);
    try {
      const { error } = await authClient.updateUser({ name: value.trim() });
      if (error) throw new Error("Failed to update display name");

      initialValueRef.current = value;
      refetch();
      toast.success("Display name has been updated");
    } catch (_err) {
      toast.error("Failed to update display name");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="text-xl">Display Name</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          Enter your full name, or a display name you are comfortable with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          aria-label="Display name"
          className="w-[calc(32ch+2rem)]"
          maxLength={32}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isSaving || isPending || initialValueRef.current == null}
        />
      </CardContent>
      <CardFooter className="bg-muted/70 border-t min-h-16 !py-4">
        <p className="text-sm text-muted-foreground">
          Please use 32 characters at maximum.
        </p>
        <Button
          type="button"
          size="sm"
          className={cn("ml-auto", !disableSave && "cursor-pointer")}
          disabled={disableSave}
          onClick={() => {
            void handleSave();
          }}
        >
          {isSaving && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
