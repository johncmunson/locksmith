import Link from "next/link";
import { SettingsAvatarCard } from "@/components/app/settings-avatar-card";
import { SettingsDeleteAccountCard } from "@/components/app/settings-delete-account-card";
import { SettingsDisplayNameCard } from "@/components/app/settings-display-name-card";
import { SettingsSessionManagementCard } from "@/components/app/settings-session-management-card";
import { SettingsSignInMethodsCard } from "@/components/app/settings-sign-in-methods-card";

export default function SettingsPage() {
  return (
    <div className="px-2 my-8 mx-auto max-w-3xl grid gap-8">
      <Link
        href="/"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors self-start underline"
      >
        &lt;&lt; Back to app
      </Link>
      <SettingsAvatarCard />
      <SettingsDisplayNameCard />
      <SettingsSignInMethodsCard />
      <SettingsSessionManagementCard />
      <SettingsDeleteAccountCard />
    </div>
  );
}
