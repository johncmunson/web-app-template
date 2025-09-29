import { SettingsAvatarCard } from "@/components/app/settings-avatar-card"
import { SettingsDeleteAccountCard } from "@/components/app/settings-delete-account-card"
import { SettingsDisplayNameCard } from "@/components/app/settings-display-name-card"
import { SettingsSignInMethodsCard } from "@/components/app/settings-sign-in-methods-card"
import { SettingsSessionManagementCard } from "@/components/app/settings-session-management-card"

export default function Page() {
  return (
    // Use grid or flexbox to give some vertical spacing between the cards
    <div className="m-8 grid gap-8">
      <SettingsAvatarCard />
      <SettingsDisplayNameCard />
      <SettingsSignInMethodsCard />
      <SettingsSessionManagementCard />
      <SettingsDeleteAccountCard />
    </div>
  )
}
