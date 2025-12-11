import { SettingsAvatarCard } from "@/components/app/settings-avatar-card";
import { SettingsDeleteAccountCard } from "@/components/app/settings-delete-account-card";
import { SettingsDisplayNameCard } from "@/components/app/settings-display-name-card";
import { SettingsSessionManagementCard } from "@/components/app/settings-session-management-card";
import { SettingsSignInMethodsCard } from "@/components/app/settings-sign-in-methods-card";

export default function SettingsPage() {
  return (
    <div className="px-2 my-8 mx-auto max-w-3xl grid gap-8">
      <SettingsAvatarCard />
      <SettingsDisplayNameCard />
      <SettingsSignInMethodsCard />
      <SettingsSessionManagementCard />
      <SettingsDeleteAccountCard />
    </div>
  );
}
