"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  setAvatarFromImageUpload,
  setAvatarFromInitials,
  setAvatarFromLinkedAccount,
} from "@/actions/set-avatar-image";
import { authClient } from "@/lib/auth-client";

/**
 * SettingsAvatarCard
 * - Clicking the avatar opens a dropdown menu.
 * - Root menu items:
 *   • Upload image → opens native file picker
 *   • Use linked account → swaps menu items to Google/Github/Microsoft
 *   • Type initials → replaces menu with an Input + confirm/cancel icons
 * - Initials input accepts exactly two characters, displays uppercase, and only then enables confirm.
 */
export function SettingsAvatarCard() {
  const { data: session, refetch } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [menuMode, setMenuMode] = useState<"root" | "linked" | "initials">(
    "root",
  );
  const [initialsDraft, setInitialsDraft] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingInitials, setIsSettingInitials] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkedProviders, setLinkedProviders] = useState<
    Record<string, { accountId: string; image: string }>
  >({});
  const [updatingProvider, setUpdatingProvider] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarSrc = session?.user.image ?? null;
  const initials =
    avatarSrc?.length === 2
      ? avatarSrc
      : session?.user.name
        ? session.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "";

  // Helps ensure Avatar component remounts when switching between image/initials modes
  const isImage = Boolean(avatarSrc && avatarSrc.length > 2);
  const avatarKey = isImage ? `img:${avatarSrc}` : `initials:${initials || ""}`;

  // Reset state when menu closes
  useEffect(() => {
    if (!open) {
      setMenuMode("root");
      setInitialsDraft("");
    }
  }, [open]);

  // Fetch linked accounts when menu opens
  useEffect(() => {
    if (!open) return;

    async function fetchAccounts() {
      try {
        const res = await authClient.listAccounts();
        if (res.data) {
          const linked: Record<string, { accountId: string; image: string }> =
            {};
          for (const acc of res.data) {
            if (["google", "github", "microsoft"].includes(acc.providerId)) {
              try {
                const info = await authClient.accountInfo({
                  accountId: acc.accountId,
                });
                linked[acc.providerId] = {
                  accountId: acc.accountId,
                  image: info.data?.user?.image ?? "",
                };
              } catch (error) {
                console.error(
                  `Failed to fetch account info for ${acc.providerId}`,
                  error,
                );
              }
            }
          }
          setLinkedProviders(linked);
        }
      } catch (error) {
        console.error("Failed to fetch accounts", error);
      }
    }

    void fetchAccounts();
  }, [open]);

  async function uploadAvatar(file: File): Promise<boolean> {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await setAvatarFromImageUpload(formData);
      refetch();
      return true;
    } catch (error: unknown) {
      toast.error(
        `Failed to upload avatar: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error("Failed to upload avatar", error);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (await uploadAvatar(file)) {
      setOpen(false);
    }
  }

  async function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file?.type.startsWith("image/")) {
        await uploadAvatar(file);
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  async function confirmInitials() {
    if (initialsDraft.length === 2) {
      setIsSettingInitials(true);
      try {
        await setAvatarFromInitials(initialsDraft);
        refetch();
        setOpen(false);
      } catch (error) {
        toast.error("Failed to set initials");
        console.error("Set initials error", error);
      } finally {
        setIsSettingInitials(false);
      }
    }
  }

  async function handlePickLinkedProvider(provider: string) {
    const providerData = linkedProviders[provider];
    if (!providerData?.image) return;

    setUpdatingProvider(provider);
    try {
      await setAvatarFromLinkedAccount(providerData.image);
      refetch();
      setOpen(false);
    } catch (error) {
      toast.error(`Failed to set avatar from ${provider}`);
      console.error(error);
    } finally {
      setUpdatingProvider(null);
    }
  }

  return (
    <Card className="pb-0">
      <CardHeader className="gap-x-6 gap-y-1.5">
        <CardTitle className="text-xl">Avatar</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          <p>This is your avatar.</p>
          <p>
            Click the avatar to upload an image, use a linked account, or set
            initials. Drag-and-drop is also supported.
          </p>
        </CardDescription>
        <CardAction>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open avatar actions"
                onDrop={(e) => {
                  void handleDrop(e);
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "cursor-pointer rounded-full outline-2 outline-dashed outline-gray-300 hover:outline-gray-500 outline-offset-2 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                  isDragOver && "outline-gray-500",
                )}
              >
                <Avatar key={avatarKey} className="size-18">
                  {isImage && avatarSrc ? (
                    <AvatarImage
                      src={avatarSrc}
                      alt="User avatar"
                      crossOrigin="anonymous"
                    />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end" className="w-56">
              {menuMode === "root" && (
                <RootMenu
                  onUpload={() => {
                    handlePickFile();
                  }}
                  onUseLinked={(e) => {
                    e.preventDefault(); // keep menu open while swapping content
                    setMenuMode("linked");
                  }}
                  onTypeInitials={(e) => {
                    e.preventDefault(); // keep menu open while swapping content
                    setMenuMode("initials");
                  }}
                  isUploading={isUploading}
                />
              )}

              {menuMode === "linked" && (
                <LinkedAccountsMenu
                  onBack={() => setMenuMode("root")}
                  onPick={(provider) => {
                    void handlePickLinkedProvider(provider);
                  }}
                  linkedProviders={linkedProviders}
                  updatingProvider={updatingProvider}
                />
              )}

              {menuMode === "initials" && (
                <InitialsMenu
                  initialsDraft={initialsDraft}
                  setInitialsDraft={(val) =>
                    setInitialsDraft(
                      val.replace(/\s+/g, "").toUpperCase().slice(0, 2),
                    )
                  }
                  onCancel={() => setMenuMode("root")}
                  onConfirm={confirmInitials}
                  isSettingInitials={isSettingInitials}
                />
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file input for "Upload image" */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              void handleFileChange(e);
            }}
          />
        </CardAction>
      </CardHeader>
      <CardFooter className="bg-muted/70 border-t min-h-16 !py-4">
        <p className="text-sm text-muted-foreground">
          An avatar is optional but strongly recommended.
        </p>
      </CardFooter>
    </Card>
  );
}

function RootMenu({
  onUpload,
  onUseLinked,
  onTypeInitials,
  isUploading,
}: {
  onUpload: () => void;
  onUseLinked: (e: Event) => void;
  onTypeInitials: (e: Event) => void;
  isUploading: boolean;
}) {
  return (
    <div>
      <DropdownMenuLabel>Change avatar</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={onUpload}
        disabled={isUploading}
      >
        Upload image
        {isUploading && <Loader2 className="mr-2 size-4 animate-spin" />}
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onUseLinked}>
        Use linked account
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onTypeInitials}>
        Type initials
      </DropdownMenuItem>
    </div>
  );
}

function LinkedAccountsMenu({
  onBack,
  onPick,
  linkedProviders,
  updatingProvider,
}: {
  onBack: () => void;
  onPick: (provider: string) => void;
  linkedProviders: Record<string, { accountId: string; image: string }>;
  updatingProvider: string | null;
}) {
  const providers = [
    { label: "Google", id: "google" },
    { label: "Github", id: "github" },
    { label: "Microsoft", id: "microsoft" },
  ];

  return (
    <div>
      <DropdownMenuLabel className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md px-1 py-0.5 text-xs hover:bg-accent"
          onClick={onBack}
          aria-label="Back"
        >
          ←
        </button>
        Choose provider
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {providers.map((p) => (
        <DropdownMenuItem
          key={p.id}
          onSelect={(e) => e.preventDefault()}
          onClick={() => onPick(p.id)}
          disabled={!linkedProviders[p.id]?.image || updatingProvider === p.id}
        >
          {p.label}
          {updatingProvider === p.id && (
            <Loader2 className="ml-2 size-4 animate-spin" />
          )}
        </DropdownMenuItem>
      ))}
    </div>
  );
}

function InitialsMenu({
  initialsDraft,
  setInitialsDraft,
  onCancel,
  onConfirm,
  isSettingInitials,
}: {
  initialsDraft: string;
  setInitialsDraft: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  isSettingInitials: boolean;
}) {
  const valid = initialsDraft.length === 2;
  return (
    <div className="p-1">
      <DropdownMenuLabel className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md px-1 py-0.5 text-xs hover:bg-accent"
          onClick={onCancel}
          aria-label="Back"
        >
          ←
        </button>
        Enter initials
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !isSettingInitials) void onConfirm();
        }}
        className="flex items-center gap-2 p-2 pt-3"
      >
        <Input
          aria-label="Initials"
          value={initialsDraft}
          onChange={(e) => setInitialsDraft(e.target.value)}
          placeholder="AB"
          inputMode="text"
          maxLength={2}
          className="h-8 w-24 text-center uppercase rounded-lg"
        />
        <Button
          size="sm"
          type="submit"
          className="rounded-lg cursor-pointer"
          aria-label="Confirm initials"
          aria-disabled={!valid || isSettingInitials}
          disabled={!valid || isSettingInitials}
        >
          {isSettingInitials ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CircleCheck className="size-5" />
          )}
        </Button>
        <Button
          size="sm"
          type="button"
          className="rounded-lg cursor-pointer"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <CircleX className="size-5" />
        </Button>
      </form>
    </div>
  );
}
