"use client"

import { useRef, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function SettingsDisplayNameCard() {
  const initialValueRef = useRef<string>("")
  const [value, setValue] = useState<string>(initialValueRef.current)
  const [isSaving, setIsSaving] = useState(false)

  const isEdited = value !== initialValueRef.current
  const isEmpty = value.trim().length === 0
  const isTooLong = value.length > 32
  const disableSave = isSaving || !isEdited || isEmpty || isTooLong

  async function handleSave() {
    if (disableSave) return
    setIsSaving(true)
    try {
      // Mock backend call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Consider it saved: update "initial" value so button disables again
      initialValueRef.current = value
      toast.success("Display name has been updated")
    } catch (error) {
      toast.error("Failed to update display name")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="pb-0">
      <CardHeader>
        <CardTitle className="text-xl">Display Name</CardTitle>
        <CardDescription className="text-base text-card-foreground">
          Enter your full name, or a display name you are comfortable with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          aria-label="Display name"
          className="w-[calc(32ch+2rem)]"
          maxLength={32}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isSaving}
        />
      </CardContent>
      <CardFooter className="bg-muted/70 border-t h-16 !py-4">
        <p className="text-sm text-muted-foreground">
          Please use 32 characters at maximum.
        </p>
        <Button
          type="button"
          size="sm"
          className={cn("ml-auto", !disableSave && "cursor-pointer")}
          disabled={disableSave}
          onClick={handleSave}
        >
          {isSaving && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}
