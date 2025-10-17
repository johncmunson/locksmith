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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn, capitalize } from "@/lib/utils";
import {
  ExternalLink,
  Loader2,
  Mail,
  MoreHorizontal,
  RotateCcw,
  Unplug,
} from "lucide-react";
import * as React from "react";
import { setPasswordAction } from "@/actions/auth";
import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { MicrosoftIcon } from "@/components/icons/microsoft-icon";
import { authClient } from "@/lib/auth-client";

interface Provider {
  id: "credential" | "google" | "github" | "microsoft";
  name: string;
  detailWhenDisconnected: string;
  isConnected: boolean;
  connecting?: boolean;
  lastUsed?: Date | null;
  icon: React.ReactNode;
}

export function formatLastUsed(
  date?: Date | null,
  locale: Intl.LocalesArgument = "en-US", // default is explicit to avoid SSR hydration mismatches
): string {
  if (!date) return "";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const defaultProviders: Provider[] = [
  {
    id: "credential",
    name: "Email/Password",
    detailWhenDisconnected: "Enable email + password login",
    isConnected: false,
    lastUsed: null,
    icon: <Mail />,
  },
  {
    id: "google",
    name: "Google",
    detailWhenDisconnected: "Connect your Google account",
    isConnected: false,
    lastUsed: null,
    icon: <GoogleIcon />,
  },
  {
    id: "github",
    name: "GitHub",
    detailWhenDisconnected: "Connect your GitHub account",
    isConnected: false,
    lastUsed: null,
    icon: <GithubIcon />,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    detailWhenDisconnected: "Connect your Microsoft account",
    isConnected: false,
    lastUsed: null,
    icon: <MicrosoftIcon />,
  },
];

export function SettingsSignInMethodsCard() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"set" | "change">("set");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSettingPassword, setIsSettingPassword] = React.useState(false);
  const [providers, setProviders] =
    React.useState<Provider[]>(defaultProviders);

  const loadLinkedProviders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Some versions return an array; others return { data }
      const result = await authClient.listAccounts();
      const accounts = result.data ?? [];

      const latestDates: Partial<Record<Provider["id"], Date>> = {};
      const connectedSet = new Set<Provider["id"]>();

      // Type guard to ensure we only use supported provider ids
      const isSupported = (id: string): id is Provider["id"] =>
        defaultProviders.some((p) => p.id === id);

      for (const acc of accounts) {
        const id = String(acc.providerId ?? "").toLowerCase();
        if (!isSupported(id)) continue;
        connectedSet.add(id);
        const updated = acc.updatedAt || acc.createdAt;
        if (updated && !Number.isNaN(updated.getTime())) {
          const prev = latestDates[id];
          if (!prev || updated > prev) latestDates[id] = updated;
        }
      }

      setProviders(() =>
        defaultProviders.map((p) => ({
          ...p,
          isConnected: connectedSet.has(p.id),
          lastUsed: latestDates[p.id] ?? null,
          connecting: false,
        })),
      );
    } catch (_err) {
      toast.error("Failed to load sign-in methods");
      // Fall back to defaults (all disconnected)
      setProviders(defaultProviders);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadLinkedProviders();
  }, [loadLinkedProviders]);

  const setProvider = (
    id: Provider["id"],
    updater: (p: Provider) => Provider,
  ) => {
    setProviders((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
  };

  const onConnect = async (id: Provider["id"]) => {
    if (id === "credential") {
      // Open dialog to set a password instead of immediate connect
      setDialogMode("set");
      setIsPasswordDialogOpen(true);
      return;
    }
    // Link social provider to the current account
    setProvider(id, (p) => ({ ...p, connecting: true }));
    try {
      await authClient.linkSocial({
        provider: id,
        callbackURL: "/settings",
      });
      // The user will be redirected back to /settings after linking, so no need to reload providers
      // await loadLinkedProviders()
    } catch (_err) {
      toast.error("Failed to connect account");
    } finally {
      setProvider(id, (p) => ({ ...p, connecting: false }));
    }
  };

  const onDisconnect = async (id: Provider["id"]) => {
    if (id !== "credential") {
      try {
        setProvider(id, (p) => ({ ...p, connecting: true }));
        const { error } = await authClient.unlinkAccount({ providerId: id });
        if (error) throw new Error(error.message);
        toast.success(`${capitalize(id)} disconnected`);
        await loadLinkedProviders();
      } catch (err: unknown) {
        toast.error((err as Error)?.message || `Failed to disconnect ${id}`);
      } finally {
        setProvider(id, (p) => ({ ...p, connecting: false }));
      }
      return;
    }
    // Unlink credential provider from account
    try {
      setProvider("credential", (p) => ({ ...p, connecting: true }));
      const { error } = await authClient.unlinkAccount({
        providerId: "credential",
      });
      if (error) throw new Error(error.message);
      toast.success("Email/Password disconnected");
      await loadLinkedProviders();
    } catch (err: unknown) {
      toast.error(
        (err as Error)?.message || "Failed to disconnect Email/Password",
      );
    } finally {
      setProvider("credential", (p) => ({ ...p, connecting: false }));
    }
  };

  const onReauth = async (id: Provider["id"]) => {
    setProvider(id, (p) => ({ ...p, connecting: true }));
    try {
      await authClient.linkSocial({
        provider: id,
        callbackURL: "/settings",
      });
    } catch (_err) {
      toast.error("Failed to re-authenticate");
    } finally {
      setProvider(id, (p) => ({ ...p, connecting: false }));
    }
  };

  const handleConfirmSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      toast.error("Passwords do not match");
      return;
    }
    setIsSettingPassword(true);
    try {
      // Server action: sets credential password and links Email/Password
      await setPasswordAction(newPassword.trim());
      await loadLinkedProviders();
      setIsPasswordDialogOpen(false);
      toast.success(
        "Email/password sign-in enabled. You can now log in with your email and password.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to set password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Change existing password flow reuses the same dialog
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPassword || newPassword.trim().length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (!confirmPassword) {
      toast.error("Please confirm your new password");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      toast.error("New passwords do not match");
      return;
    }
    setIsSettingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: newPassword.trim(),
        currentPassword: currentPassword.trim(),
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
      setIsPasswordDialogOpen(false);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await loadLinkedProviders();
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Failed to change password");
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="text-xl">Sign-in Methods</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          Customize how you access your account. Use an email/password or link
          an OAuth provider for seamless, secure authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {isLoading
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto] items-center gap-5",
                  i === 0 ? "pb-4" : i === 3 ? "pt-4" : "py-4",
                )}
              >
                <div className="size-5 rounded bg-muted animate-pulse" />
                <div className="space-y-2 w-full max-w-[520px]">
                  <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-9 w-20 rounded bg-muted animate-pulse" />
              </div>
            ))
          : providers.map((p, index) => {
              const connected = p.isConnected;
              const connecting = Boolean(p.connecting);
              const lastUsed = formatLastUsed(p.lastUsed);
              return (
                // Each row is a responsive grid with three zones: [icon] [label/description] [actions]
                <div
                  key={p.id}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-5",
                    index === 0
                      ? "pb-4"
                      : index === providers.length - 1
                        ? "pt-4"
                        : "py-4",
                  )}
                >
                  {p.icon}
                  <div className="space-y-1 min-w-0">
                    <div className="font-medium leading-none">{p.name}</div>
                    {/* Keep a single text line that switches content based on connection state. */}
                    <div className="text-sm text-muted-foreground">
                      {connected ? (
                        <span>
                          Connected
                          {/* On small screens, include last-used inline to keep info visible */}
                          {lastUsed ? (
                            <span className="sm:hidden">
                              {" "}
                              • Last used {lastUsed}
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span>{p.detailWhenDisconnected}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* On larger screens, show last-used on the right to balance the row */}
                    {connected && lastUsed ? (
                      <span className="text-sm text-muted-foreground hidden sm:inline-block">
                        Last used {lastUsed}
                      </span>
                    ) : null}
                    {connected ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                            aria-label={`More options for ${p.name}`}
                          >
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {p.id === "credential" ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDialogMode("change");
                                  setIsPasswordDialogOpen(true);
                                }}
                              >
                                <RotateCcw />
                                Change Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  void onDisconnect(p.id);
                                }}
                                variant="destructive"
                              >
                                <Unplug />
                                Disconnect
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem
                                onClick={() => toast(`Opening ${p.name}…`)}
                              >
                                <ExternalLink />
                                Manage on {p.name}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  void onReauth(p.id);
                                }}
                              >
                                <RotateCcw />
                                Re-authenticate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  void onDisconnect(p.id);
                                }}
                                variant="destructive"
                              >
                                <Unplug />
                                Disconnect
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          void onConnect(p.id);
                        }}
                        className={cn(connecting ? "" : "cursor-pointer")}
                        disabled={connecting}
                      >
                        {connecting && (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        )}
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
      </CardContent>
      <CardFooter className="bg-muted/70 border-t min-h-16 !py-4">
        <p className="text-sm text-muted-foreground">
          All connected sign-in methods must use the same associated email
          address.
        </p>
      </CardFooter>
      {/* Password setup/change dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "set" ? "Set your password" : "Change password"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "set"
                ? "By setting a password, you'll be able to sign in using your email and password in addition to any connected providers."
                : "Enter your current password and choose a new one."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              if (dialogMode === "set") {
                void handleConfirmSetPassword(e);
              } else {
                void handleChangePassword(e);
              }
            }}
          >
            <div className="space-y-5">
              {dialogMode === "change" ? (
                <div className="space-y-2">
                  <Label htmlFor="settings-current">Current password</Label>
                  <Input
                    id="settings-current"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isSettingPassword}
                    autoComplete="current-password"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="settings-new">
                  {dialogMode === "set" ? "Password" : "New password"}
                </Label>
                <Input
                  id="settings-new"
                  type="password"
                  placeholder={
                    dialogMode === "set"
                      ? "Enter a strong password"
                      : "Enter a new password"
                  }
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSettingPassword}
                  autoComplete="new-password"
                />
              </div>
              {dialogMode === "change" ? (
                <div className="space-y-2">
                  <Label htmlFor="settings-confirm">Confirm new password</Label>
                  <Input
                    id="settings-confirm"
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSettingPassword}
                  />
                </div>
              ) : null}
              {dialogMode === "set" ? (
                <div className="space-y-2">
                  <Label htmlFor="settings-confirm">Confirm password</Label>
                  <Input
                    id="settings-confirm"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSettingPassword}
                  />
                </div>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                className={cn(isSettingPassword ? "" : "cursor-pointer")}
                disabled={isSettingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={cn(isSettingPassword ? "" : "cursor-pointer")}
                disabled={
                  isSettingPassword ||
                  (dialogMode === "change" && !currentPassword) ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                {isSettingPassword && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {dialogMode === "set" ? "Confirm" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
