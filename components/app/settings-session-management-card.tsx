"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DeviceSession {
  id: string
  userId: string
  token: string
  createdAt: string | Date
  updatedAt: string | Date
  expiresAt: string | Date
  ipAddress?: string | null
  userAgent?: string | null
}

export function SettingsSessionManagementCard() {
  const router = useRouter()
  const { data: currentSession } = authClient.useSession()
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [rowLoading, setRowLoading] = useState<Record<string, boolean>>({})
  const [revokeOthersLoading, setRevokeOthersLoading] = useState(false)
  const [revokeAllLoading, setRevokeAllLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentToken = currentSession?.session.token

  const formatDateTime = (value?: string | number | Date | null) => {
    if (!value) return "—"
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return "—"
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d)
  }

  const loadSessions = useCallback(async (replaceList = false) => {
    setError(null)
    if (replaceList) setIsLoading(true)
    else setIsRefreshing(true)
    try {
      const result: any = await authClient.listSessions()
      const list: DeviceSession[] = Array.isArray(result)
        ? result
        : (result?.data ?? [])
      setSessions(list)
    } catch (_err) {
      setError("Failed to load sessions")
      toast.error("Failed to load sessions")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadSessions(true)
  }, [loadSessions])

  const revokeOne = async (token: string, isCurrent: boolean) => {
    if (!token) return
    try {
      setRowLoading((m) => ({ ...m, [token]: true }))
      if (isCurrent) {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push("/sign-in"),
          },
        })
        return
      }
      await authClient.revokeSession({ token })
      toast.success("Session revoked")
      await loadSessions(false)
    } catch (_err) {
      toast.error("Failed to revoke session")
    } finally {
      setRowLoading((m) => ({ ...m, [token]: false }))
    }
  }

  const revokeOthers = async () => {
    try {
      setRevokeOthersLoading(true)
      await authClient.revokeOtherSessions()
      toast.success("Signed out other devices")
      await loadSessions(false)
    } catch (_err) {
      toast.error("Failed to sign out other devices")
    } finally {
      setRevokeOthersLoading(false)
    }
  }

  const revokeAll = async () => {
    try {
      setRevokeAllLoading(true)
      await authClient.revokeSessions({
        fetchOptions: {
          onSuccess: () => router.push("/sign-in"),
        },
      })
    } catch (_err) {
      toast.error("Failed to sign out all devices")
    } finally {
      setRevokeAllLoading(false)
    }
  }

  const refresh = async () => {
    await loadSessions(false)
  }

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
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]",
                i === 0 ? "pb-4" : i === 2 ? "pt-4" : "py-4",
              )}
            >
              <div className="space-y-2 animate-pulse">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-full max-w-[520px] rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
              <div className="flex items-start justify-start sm:justify-end">
                <div className="h-9 w-24 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))
        ) : sessions && sessions.length > 0 ? (
          sessions.map((s, index) => {
            const token = s.token
            const isCurrent = token === currentToken
            const created = s.createdAt
            const lastActive = s.updatedAt
            const expires = s.expiresAt
            const ip = s.ipAddress || "—"
            const { os, browser, deviceType } = parseUserAgent(
              s.userAgent || "",
            )
            const loading =
              Boolean(rowLoading[token]) ||
              revokeAllLoading ||
              revokeOthersLoading

            return (
              <div
                key={token || index}
                className={cn(
                  "grid gap-3 sm:grid-cols-[1fr_auto]",
                  index === 0
                    ? "pb-4"
                    : index === sessions.length - 1
                      ? "pt-4"
                      : "py-4",
                )}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-medium truncate">
                      {`${browser} on ${os} (${deviceType})`}
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-primary uppercase tracking-wide">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
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
                </div>
                <div className="flex items-start justify-start sm:justify-end">
                  <Button
                    type="button"
                    size="sm"
                    className={cn(loading ? "" : "cursor-pointer")}
                    disabled={loading || !token}
                    onClick={() => revokeOne(token, isCurrent)}
                  >
                    {loading && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {isCurrent ? "Sign out here" : "Revoke"}
                  </Button>
                </div>
              </div>
            )
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
            className={cn(
              isRefreshing || revokeAllLoading || revokeOthersLoading
                ? ""
                : "cursor-pointer",
            )}
            disabled={isRefreshing || revokeAllLoading || revokeOthersLoading}
            onClick={refresh}
          >
            {isRefreshing && <Loader2 className="mr-2 size-4 animate-spin" />}
            Refresh
          </Button>
          <Button
            type="button"
            size="sm"
            className={cn(
              revokeOthersLoading || revokeAllLoading ? "" : "cursor-pointer",
            )}
            disabled={
              revokeOthersLoading ||
              revokeAllLoading ||
              isRefreshing ||
              isLoading ||
              (sessions ? sessions.length < 2 : true)
            }
            onClick={revokeOthers}
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
            onClick={revokeAll}
          >
            {revokeAllLoading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Sign out all devices
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Basic user-agent parser to extract OS, browser, and device type
// A more robust solution would involve using a library like "ua-parser-js"
// https://github.com/faisalman/ua-parser-js
function parseUserAgent(ua: string): {
  os: string
  browser: string
  deviceType: string
} {
  let os = "Unknown"
  let browser = "Unknown"
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "unknown"

  // --- OS detection ---
  if (/Windows NT 10.0/.test(ua)) {
    os = "Windows 10"
  } else if (/Windows NT 11.0/.test(ua)) {
    os = "Windows 11"
  } else if (/Mac OS X/.test(ua)) {
    os = "macOS"
  } else if (/Android/.test(ua)) {
    os = "Android"
  } else if (/iPhone|iPad|iPod/.test(ua)) {
    os = "iOS"
  } else if (/Linux/.test(ua)) {
    os = "Linux"
  }

  // --- Browser detection ---
  if (/Edg\//.test(ua)) {
    browser = "Edge"
  } else if (/Chrome\//.test(ua)) {
    browser = "Chrome"
  } else if (/Safari\//.test(ua) && /Version\//.test(ua)) {
    browser = "Safari"
  } else if (/Firefox\//.test(ua)) {
    browser = "Firefox"
  }

  // --- Device type detection ---
  if (/Mobi|Android/.test(ua)) {
    deviceType = "mobile"
  } else if (/iPad|Tablet/.test(ua)) {
    deviceType = "tablet"
  } else if (os !== "Unknown") {
    deviceType = "desktop"
  }

  return { os, browser, deviceType }
}
