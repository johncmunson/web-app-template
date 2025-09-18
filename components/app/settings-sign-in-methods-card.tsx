"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GithubIcon } from "@/components/icons/github-icon"
import { GoogleIcon } from "@/components/icons/google-icon"
import { MicrosoftIcon } from "@/components/icons/microsoft-icon"
import {
  MoreHorizontal,
  Loader2,
  Unplug,
  RotateCcw,
  ExternalLink,
  Mail,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Provider {
  id: "password" | "google" | "github" | "microsoft"
  name: string
  detailWhenDisconnected: string
  isConnected: boolean
  connecting?: boolean
  lastUsed?: Date | null
  icon: React.ReactNode
}

export function formatLastUsed(
  date?: Date | null,
  locale: Intl.LocalesArgument = "en-US", // default is explicit to avoid SSR hydration mismatches
): string {
  if (!date) return ""

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

async function fakeApiConnect(): Promise<void> {
  // Simulate latency and a ~25% failure rate
  await new Promise((r) => setTimeout(r, 1200))
  if (Math.random() < 0.25) {
    throw new Error("connect-failed")
  }
}

export function SettingsSignInMethodsCard() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false)
  const [passwordValue, setPasswordValue] = React.useState("")
  const [isSettingPassword, setIsSettingPassword] = React.useState(false)
  const [providers, setProviders] = React.useState<Provider[]>([
    {
      id: "password",
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
  ])

  const setProvider = (
    id: Provider["id"],
    updater: (p: Provider) => Provider,
  ) => {
    setProviders((prev) => prev.map((p) => (p.id === id ? updater(p) : p)))
  }

  const onConnect = async (id: Provider["id"]) => {
    if (id === "password") {
      // Open dialog to set a password instead of immediate connect
      setIsPasswordDialogOpen(true)
      return
    }
    setProvider(id, (p) => ({ ...p, connecting: true }))
    try {
      await fakeApiConnect()
      setProvider(id, (p) => ({
        ...p,
        isConnected: true,
        connecting: false,
        lastUsed: new Date(),
      }))
    } catch (_err) {
      setProvider(id, (p) => ({ ...p, connecting: false }))
      toast.error("Failed to connect account")
    }
  }

  const onDisconnect = (id: Provider["id"]) => {
    setProvider(id, (p) => ({ ...p, isConnected: false, lastUsed: null }))
  }

  const onReauth = async (id: Provider["id"]) => {
    setProvider(id, (p) => ({ ...p, connecting: true }))
    try {
      await fakeApiConnect()
      setProvider(id, (p) => ({
        ...p,
        connecting: false,
        lastUsed: new Date(),
        isConnected: true,
      }))
      toast("Re-authenticated")
    } catch (_err) {
      setProvider(id, (p) => ({ ...p, connecting: false }))
      toast.error("Failed to connect account")
    }
  }

  const handleConfirmSetPassword = async () => {
    if (!passwordValue || passwordValue.trim().length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setIsSettingPassword(true)
    try {
      await fakeApiConnect()
      // On success, enable password provider
      setProvider("password", (p) => ({
        ...p,
        isConnected: true,
        lastUsed: new Date(),
      }))
      setIsPasswordDialogOpen(false)
      toast.success(
        "Email/password sign-in enabled. You can now log in with your email and password.",
      )
      setPasswordValue("")
    } catch (_err) {
      setIsPasswordDialogOpen(false)
      toast.error("Failed to set password. Please try again.")
    } finally {
      setIsSettingPassword(false)
    }
  }

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
        {providers.map((p, index) => {
          const connected = p.isConnected
          const connecting = Boolean(p.connecting)
          const lastUsed = formatLastUsed(p.lastUsed)
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
                      {p.id === "password" ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => setIsPasswordDialogOpen(true)}
                          >
                            <RotateCcw />
                            Change Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDisconnect(p.id)}
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
                          <DropdownMenuItem onClick={() => onReauth(p.id)}>
                            <RotateCcw />
                            Re-authenticate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDisconnect(p.id)}
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
                    onClick={() => onConnect(p.id)}
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
          )
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
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set your password</DialogTitle>
            <DialogDescription>
              By setting a password, you&apos;ll be able to sign in using your
              email and password in addition to any connected providers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="settings-password">Password</Label>
            <Input
              id="settings-password"
              type="password"
              placeholder="Enter a strong password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              disabled={isSettingPassword}
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 characters. Use a mix of letters, numbers, and symbols.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              disabled={isSettingPassword}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSetPassword}
              disabled={isSettingPassword}
            >
              {isSettingPassword && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
