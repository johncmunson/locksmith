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
import { toast } from "sonner";
import { cn, capitalize } from "@/lib/utils";
import {
  FileQuestionMark,
  Loader2,
  MonitorCheck,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface DeviceSession {
  id: string;
  userId: string;
  token: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  expiresAt: string | Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export function SettingsSessionManagementCard() {
  const router = useRouter();
  const { data: currentSession } = authClient.useSession();
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({});
  const [revokeOthersLoading, setRevokeOthersLoading] = useState(false);
  const [revokeAllLoading, setRevokeAllLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentToken = currentSession?.session.token;

  const getDeviceIcon = (device: Device) => {
    switch (device) {
      case "desktop":
        return MonitorCheck;
      case "tablet":
        return Tablet;
      case "mobile":
        return Smartphone;
      default:
        return FileQuestionMark;
    }
  };

  const formatDateTime = (value?: string | number | Date | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  };

  const loadSessions = useCallback(async (replaceList = false) => {
    setError(null);
    if (replaceList) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const result = await authClient.listSessions();
      const list: DeviceSession[] = Array.isArray(result)
        ? result
        : (result?.data ?? []);
      setSessions(list);
    } catch (_err) {
      setError("Failed to load sessions");
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions(true);
  }, [loadSessions]);

  const revokeOne = async (token: string, isCurrent: boolean) => {
    if (!token) return;
    try {
      setRowLoading((m) => ({ ...m, [token]: true }));
      if (isCurrent) {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push("/sign-in"),
          },
        });
        return;
      }
      await authClient.revokeSession({ token });
      toast.success("Session revoked");
      await loadSessions(false);
    } catch (_err) {
      toast.error("Failed to revoke session");
    } finally {
      setRowLoading((m) => ({ ...m, [token]: false }));
    }
  };

  const revokeOthers = async () => {
    try {
      setRevokeOthersLoading(true);
      await authClient.revokeOtherSessions();
      toast.success("Signed out other devices");
      await loadSessions(false);
    } catch (_err) {
      toast.error("Failed to sign out other devices");
    } finally {
      setRevokeOthersLoading(false);
    }
  };

  const revokeAll = async () => {
    try {
      setRevokeAllLoading(true);
      await authClient.revokeSessions({
        fetchOptions: {
          onSuccess: () => router.push("/sign-in"),
        },
      });
    } catch (_err) {
      toast.error("Failed to sign out all devices");
    } finally {
      setRevokeAllLoading(false);
    }
  };

  const refresh = async () => {
    await loadSessions(false);
  };

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="text-xl">Active Sessions</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          Review devices that are signed in to your account. Revoke any you
          don’t recognize.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y">
        {isLoading ? (
          // Initial load skeletons
          [0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[1fr_auto] gap-4 items-center",
                i === 0 ? "pb-4" : "pt-4",
              )}
            >
              <div className="space-y-2 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-2 w-12 rounded bg-muted" />
                </div>
                <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-[max-content_max-content] gap-x-6 gap-y-1 w-fit">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
              </div>
              <div className="flex items-start justify-start sm:justify-end">
                <div className="h-9 w-[109.27px] rounded bg-muted" />
              </div>
            </div>
          ))
        ) : sessions && sessions.length > 0 ? (
          sessions.map((s, index) => {
            const token = s.token;
            const isCurrent = token === currentToken;
            const created = s.createdAt;
            const lastActive = s.updatedAt;
            const expires = s.expiresAt;
            const ip = s.ipAddress ?? "—";
            const {
              os: rawOS,
              browser: rawBrowser,
              device,
            } = parseUserAgent(s.userAgent);
            const os = capitalize(rawOS);
            const browser = capitalize(rawBrowser);
            const DeviceIcon = getDeviceIcon(device);
            const loading = Boolean(rowLoading[token]);

            return (
              <div
                key={token || index}
                className={cn(
                  "grid grid-cols-[1fr_auto] gap-4 items-center",
                  index === 0
                    ? "pb-4"
                    : index === sessions.length - 1
                      ? "pt-4"
                      : "py-4",
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <DeviceIcon />
                    <div className="font-medium truncate">
                      {`${browser} on ${os}`}
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-primary uppercase tracking-wide">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-[max-content_max-content] gap-x-6 gap-y-1 w-fit">
                    <span>
                      Created:{" "}
                      <span className="font-medium">
                        {formatDateTime(created)}
                      </span>
                    </span>
                    <span>
                      Last active:{" "}
                      <span className="font-medium">
                        {formatDateTime(lastActive)}
                      </span>
                    </span>
                    <span>
                      Expires:{" "}
                      <span className="font-medium">
                        {formatDateTime(expires)}
                      </span>
                    </span>
                    <span>
                      IP: <span className="font-medium">{ip || "—"}</span>
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className={cn(
                    "min-w-[109.27px]", // Match width of "Sign out here" text to avoid layout shift
                    loading ? "" : "cursor-pointer",
                  )}
                  disabled={loading || !token}
                  onClick={() => {
                    void revokeOne(token, isCurrent);
                  }}
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {isCurrent ? "Sign out here" : "Revoke"}
                </Button>
              </div>
            );
          })
        ) : (
          <div className="py-4 text-sm text-muted-foreground">
            No active sessions.
          </div>
        )}
        {error ? (
          <div className="pt-3 text-sm text-destructive">{error}</div>
        ) : null}
      </CardContent>
      <CardFooter className="bg-muted/70 border-t min-h-16 !py-4">
        <div className="flex items-center gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(isRefreshing ? "" : "cursor-pointer")}
            disabled={isRefreshing || isLoading}
            onClick={() => {
              void refresh();
            }}
          >
            {isRefreshing && <Loader2 className="mr-2 size-4 animate-spin" />}
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn(revokeOthersLoading ? "" : "cursor-pointer")}
            disabled={
              revokeOthersLoading ||
              isRefreshing ||
              isLoading ||
              (sessions ? sessions.length < 2 : true)
            }
            onClick={() => {
              void revokeOthers();
            }}
          >
            {revokeOthersLoading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Sign out other devices
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn(revokeAllLoading ? "" : "cursor-pointer")}
            disabled={
              revokeAllLoading ||
              isRefreshing ||
              isLoading ||
              (sessions ? sessions.length === 0 : true)
            }
            onClick={() => {
              void revokeAll();
            }}
          >
            {revokeAllLoading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Sign out all devices
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Basic user-agent parser to extract OS, browser, and device type. Just focuses
// on the most common cases and attempts to avoid overfitting and false positives.
// A more robust solution would involve using a library like "ua-parser-js".
// https://github.com/faisalman/ua-parser-js
interface UserAgentMetadata {
  os: OS;
  browser: Browser;
  device: Device;
}

function parseUserAgent(uaRaw: string | null | undefined): UserAgentMetadata {
  return {
    os: detectOS(uaRaw),
    browser: detectBrowser(uaRaw),
    device: detectDeviceType(uaRaw),
  };
}

interface DeviceType {
  kind: "desktop" | "mobile" | "tablet" | "other";
}
type Device = DeviceType["kind"];

function detectDeviceType(uaRaw: string | null | undefined): Device {
  if (!uaRaw) return "other";
  const ua = uaRaw.toLowerCase();

  // --- Special cases first ---------------------------------------------------

  // iPadOS 13+ can present a desktop-like UA (contains "Macintosh" + "Mobile")
  // Example: "Macintosh; Intel Mac OS X ... Mobile/15E148 Safari/..."
  if (ua.includes("macintosh") && ua.includes("mobile")) {
    return "tablet";
  }

  // --- Tablet checks (most common) -------------------------------------------
  if (
    ua.includes("ipad") ||
    (ua.includes("android") && !ua.includes("mobile")) || // many Android tablets omit "Mobile"
    ua.includes("tablet") ||
    ua.includes("kindle") ||
    ua.includes("silk") || // Amazon Silk (Fire tablets)
    ua.includes("playbook") ||
    ua.includes("fire hd") ||
    /sm-t\d+/i.test(uaRaw) || // Samsung Galaxy Tab models (e.g., SM-T870)
    /\bnexus (7|9|10)\b/.test(ua) // Nexus tablets
  ) {
    return "tablet";
  }

  // --- Mobile checks (most common) -------------------------------------------
  if (
    ua.includes("iphone") ||
    ua.includes("ipod") ||
    (ua.includes("android") && ua.includes("mobile")) ||
    ua.includes("windows phone") ||
    ua.includes("bb10") ||
    ua.includes("blackberry") ||
    ua.includes("opera mini") ||
    // Generic "mobile" token as a last mobile heuristic (placed after iPad check above)
    /\bmobile\b/.test(ua)
  ) {
    return "mobile";
  }

  // --- Desktop checks ---------------------------------------------------------
  if (
    ua.includes("windows nt") ||
    (ua.includes("macintosh") && !ua.includes("mobile")) || // regular macOS
    ua.includes("cros") || // ChromeOS
    ua.includes("x11") || // many Linux distros
    (ua.includes("linux") && !ua.includes("android")) // exclude Android
  ) {
    return "desktop";
  }

  // --- Fallback ---------------------------------------------------------------
  return "other";
}

type Browser =
  | "chrome"
  | "safari"
  | "firefox"
  | "edge"
  | "opera"
  | "samsung_internet"
  | "ie"
  | "other";

function detectBrowser(uaRaw: string | null | undefined): Browser {
  if (!uaRaw) return "other";
  const ua = uaRaw.toLowerCase();

  // ---- Order matters: identify distinctive tokens first ---------------------

  // Microsoft Edge (Chromium uses "Edg/", Legacy used "Edge/")
  if (ua.includes("edg/") || ua.includes("edge/")) {
    return "edge";
  }

  // Samsung Internet (Android)
  if (ua.includes("samsungbrowser")) {
    return "samsung_internet";
  }

  // Opera (Chromium-based uses "OPR/"; legacy can have "Opera")
  if (ua.includes("opr/") || ua.includes("opera")) {
    return "opera";
  }

  // Firefox (desktop/mobile) + iOS wrapper ("FxiOS")
  if (ua.includes("firefox/") || ua.includes("fxios")) {
    return "firefox";
  }

  // Chrome family (desktop/mobile) + iOS wrapper ("CriOS") + Chromium
  // Exclude brands that piggyback on the Chrome token (Edge/Opera/Samsung).
  if (
    (ua.includes("chrome/") ||
      ua.includes("crios") ||
      ua.includes("chromium")) &&
    !ua.includes("edg/") &&
    !ua.includes("edge/") &&
    !ua.includes("opr/") &&
    !ua.includes("samsungbrowser")
  ) {
    return "chrome";
  }

  // Safari (WebKit). On iOS all browsers use WebKit and often include "Safari",
  // so require "Version/" and exclude other Chromium/Firefox tokens.
  if (
    ua.includes("safari") &&
    ua.includes("version/") &&
    !ua.includes("chrome/") &&
    !ua.includes("crios") &&
    !ua.includes("chromium") &&
    !ua.includes("edg/") &&
    !ua.includes("edge/") &&
    !ua.includes("opr/") &&
    !ua.includes("fxios")
  ) {
    return "safari";
  }

  // Internet Explorer (rare but still seen in enterprise)
  if (ua.includes("msie ") || (ua.includes("trident/") && ua.includes("rv:"))) {
    return "ie";
  }

  // Fallback for lesser-used or ambiguous UAs (Brave, Vivaldi, UC, bots, etc.)
  return "other";
}

type OS =
  | "windows"
  | "macos"
  | "ios"
  | "android"
  | "linux"
  | "chromeos"
  | "other";

function detectOS(uaRaw: string | null | undefined): OS {
  if (!uaRaw) return "other";
  const ua = uaRaw.toLowerCase();

  // --- iOS / iPadOS (note: iPadOS 13+ can masquerade as "Macintosh" + "Mobile")
  if (
    /\b(iphone|ipad|ipod)\b/.test(ua) ||
    (ua.includes("macintosh") && ua.includes("mobile"))
  ) {
    return "ios";
  }

  // --- Android (covers phones & tablets)
  if (ua.includes("android")) {
    return "android";
  }

  // --- ChromeOS (often includes "X11; CrOS")
  if (ua.includes("cros")) {
    return "chromeos";
  }

  // --- Windows (desktop + legacy Windows Phone)
  if (ua.includes("windows")) {
    return "windows";
  }

  // --- macOS (standard desktop macOS; iPadOS spoof handled above)
  if (ua.includes("macintosh") || ua.includes("mac os x")) {
    return "macos";
  }

  // --- Linux (exclude Android which also contains "linux")
  if ((ua.includes("linux") && !ua.includes("android")) || ua.includes("x11")) {
    return "linux";
  }

  return "other";
}
