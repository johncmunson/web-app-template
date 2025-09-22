"use client"

import * as React from "react"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { CircleCheck, CircleX } from "lucide-react"
import { authClient } from "@/lib/auth-client"

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
  const { data: session, refetch } = authClient.useSession()
  const [open, setOpen] = React.useState(false)
  const [menuMode, setMenuMode] = React.useState<
    "root" | "linked" | "initials"
  >("root")
  const [initialsDraft, setInitialsDraft] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const avatarSrc = session?.user.image || null
  const initials = session?.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CN"

  // Reset state when menu closes
  React.useEffect(() => {
    if (!open) {
      setMenuMode("root")
      setInitialsDraft("")
    }
  }, [open])

  function handlePickFile() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        await refetch()
        setOpen(false)
      } else {
        // Handle error, perhaps show toast
        console.error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error", error)
    } finally {
      setIsUploading(false)
    }
  }

  function confirmInitials() {
    if (initialsDraft.length === 2) {
      // For now, just close, as initials are computed from name
      setOpen(false)
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
            initials.
          </p>
        </CardDescription>
        <CardAction>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <button type="button" aria-label="Open avatar actions">
                <Avatar className="size-18 cursor-pointer">
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt="User avatar" />
                  ) : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end" className="w-56">
              {menuMode === "root" && (
                <RootMenu
                  onUpload={() => {
                    handlePickFile()
                  }}
                  onUseLinked={(e) => {
                    e.preventDefault() // keep menu open while swapping content
                    setMenuMode("linked")
                  }}
                  onTypeInitials={(e) => {
                    e.preventDefault() // keep menu open while swapping content
                    setMenuMode("initials")
                  }}
                />
              )}

              {menuMode === "linked" && (
                <LinkedAccountsMenu
                  onBack={() => setMenuMode("root")}
                  onPick={(provider) => {
                    // Hook up to your real auth/link flow here
                    console.log(`Choose linked provider: ${provider}`)
                    setOpen(false)
                  }}
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
            onChange={handleFileChange}
          />
        </CardAction>
      </CardHeader>
      <CardFooter className="bg-muted/70 border-t min-h-16 !py-4">
        <p className="text-sm text-muted-foreground">
          An avatar is optional but strongly recommended.
        </p>
      </CardFooter>
    </Card>
  )
}

function RootMenu({
  onUpload,
  onUseLinked,
  onTypeInitials,
}: {
  onUpload: () => void
  onUseLinked: (e: Event) => void
  onTypeInitials: (e: Event) => void
}) {
  return (
    <div>
      <DropdownMenuLabel>Change avatar</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={onUpload}>
        Upload image
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onUseLinked}>
        Use linked account
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={onTypeInitials}>
        Type initials
      </DropdownMenuItem>
    </div>
  )
}

function LinkedAccountsMenu({
  onBack,
  onPick,
}: {
  onBack: () => void
  onPick: (provider: "Google" | "Github" | "Microsoft") => void
}) {
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
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => onPick("Google")}
      >
        Google
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => onPick("Github")}
      >
        Github
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => onPick("Microsoft")}
      >
        Microsoft
      </DropdownMenuItem>
    </div>
  )
}

function InitialsMenu({
  initialsDraft,
  setInitialsDraft,
  onCancel,
  onConfirm,
}: {
  initialsDraft: string
  setInitialsDraft: (v: string) => void
  onCancel: () => void
  onConfirm: () => void
}) {
  const valid = initialsDraft.length === 2
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
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Input
          aria-label="Initials"
          value={initialsDraft}
          onChange={(e) => setInitialsDraft(e.target.value)}
          placeholder="AB"
          inputMode="text"
          maxLength={2}
          className="h-8 w-24 text-center uppercase"
        />
        <button
          type="button"
          className={`rounded-md p-1 hover:bg-accent transition ${valid ? "opacity-100" : "opacity-50 cursor-not-allowed"}`}
          onClick={valid ? onConfirm : undefined}
          aria-label="Confirm initials"
          aria-disabled={!valid}
        >
          <CircleCheck className="size-5" />
        </button>
        <button
          type="button"
          className="rounded-md p-1 hover:bg-accent"
          onClick={onCancel}
          aria-label="Cancel"
        >
          <CircleX className="size-5" />
        </button>
      </div>
    </div>
  )
}
