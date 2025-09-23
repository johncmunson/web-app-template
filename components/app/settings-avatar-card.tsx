"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { CircleCheck, CircleX, Loader2 } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

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
  const [isSettingInitials, setIsSettingInitials] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const avatarSrc = session?.user.image || null
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
        : ""

  // Reset state when menu closes
  React.useEffect(() => {
    if (!open) {
      setMenuMode("root")
      setInitialsDraft("")
    }
  }, [open])

  async function uploadAvatar(file: File): Promise<boolean> {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        refetch()
        return true
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast.error("Failed to upload avatar")
      console.error("Avatar upload error", error)
      return false
    } finally {
      setIsUploading(false)
    }
  }

  function handlePickFile() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (await uploadAvatar(file)) {
      setOpen(false)
    }
  }

  async function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        await uploadAvatar(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  async function confirmInitials() {
    if (initialsDraft.length === 2) {
      setIsSettingInitials(true)
      try {
        const res = await fetch("/api/set-initials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initials: initialsDraft }),
        })
        if (res.ok) {
          refetch()
          setOpen(false)
        } else {
          throw new Error("Failed to set initials")
        }
      } catch (error) {
        toast.error("Failed to set initials")
        console.error("Set initials error", error)
      } finally {
        setIsSettingInitials(false)
      }
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
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "cursor-pointer rounded-full outline-2 outline-dashed outline-gray-300 hover:outline-gray-500 outline-offset-2 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                  isDragOver && "outline-gray-500",
                )}
              >
                <Avatar className="size-18">
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
                  isUploading={isUploading}
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
  isUploading,
}: {
  onUpload: () => void
  onUseLinked: (e: Event) => void
  onTypeInitials: (e: Event) => void
  isUploading: boolean
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
  isSettingInitials,
}: {
  initialsDraft: string
  setInitialsDraft: (v: string) => void
  onCancel: () => void
  onConfirm: () => Promise<void>
  isSettingInitials: boolean
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
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (valid && !isSettingInitials) onConfirm()
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
  )
}
