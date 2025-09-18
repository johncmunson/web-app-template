"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GithubIcon } from "@/components/icons/github-icon"
import { GoogleIcon } from "@/components/icons/google-icon"
import { MicrosoftIcon } from "@/components/icons/microsoft-icon"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Provider {
  id: "google" | "github" | "microsoft"
  name: string
  detailWhenDisconnected: string
  isConnected: boolean
  connecting?: boolean
  lastUsed?: Date | null
  icon: React.ReactNode
}

function formatLastUsed(date?: Date | null) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

async function fakeApiConnect(): Promise<void> {
  // Simulate latency and a ~25% failure rate
  await new Promise((r) => setTimeout(r, 1200))
  if (Math.random() < 0.25) {
    throw new Error("connect-failed")
  }
}

export function SettingsSignInMethodsCard() {
  const [providers, setProviders] = React.useState<Provider[]>([
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
    setProvider(id, (p) => ({ ...p, connecting: true }))
    try {
      await fakeApiConnect()
      setProvider(id, (p) => ({
        ...p,
        isConnected: true,
        connecting: false,
        lastUsed: new Date(),
      }))
    } catch (e) {
      setProvider(id, (p) => ({ ...p, connecting: false }))
      // Required by the prompt
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
    } catch (e) {
      setProvider(id, (p) => ({ ...p, connecting: false }))
      toast.error("Failed to connect account")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Sign-in Methods</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          Customize how you access your account. Use an email/password or link
          an OAuth provider for seamless, secure authentication.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {providers.map((p, idx) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{p.icon}</div>
              <div className="space-y-1">
                <div className="font-medium leading-none">{p.name}</div>
                <div className="text-sm text-muted-foreground">
                  {p.isConnected ? (
                    <span className="">Connected</span>
                  ) : (
                    <span>{p.detailWhenDisconnected}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {p.isConnected ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline-block">
                    Last used {formatLastUsed(p.lastUsed)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`More options for ${p.name}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() => toast(`Opening ${p.name}…`)}
                      >
                        Manage on {p.name}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onReauth(p.id)}>
                        Re-authenticate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDisconnect(p.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Disconnect
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => onConnect(p.id)}
                  disabled={p.connecting}
                  className="ml-2"
                >
                  {p.connecting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Connect
                </Button>
              )}
            </div>

            {idx < providers.length - 1 && (
              <Separator className="absolute left-0 right-0 bottom-0" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
