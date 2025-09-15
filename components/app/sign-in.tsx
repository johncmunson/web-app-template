"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AuthCard } from "./auth-card"
import { SocialAuthButtons } from "./social-auth-buttons"
import { useAuthAction } from "./use-auth-action"

export default function SignIn() {
  const {
    loading,
    onSignInEmailSubmit,
    signInFields,
    signInStaticFields,
    setSignInFields,
    onSignInSocialClick,
  } = useAuthAction()

  return (
    <AuthCard
      title={signInStaticFields.title}
      description={signInStaticFields.description}
      footerText={signInStaticFields.footerText}
      footerLinkText={signInStaticFields.footerLinkText}
      footerHref={signInStaticFields.footerHref}
      loading={loading}
    >
      <form
        aria-disabled={loading}
        className="grid gap-4"
        onSubmit={onSignInEmailSubmit}
      >
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            onChange={(e) =>
              setSignInFields({ ...signInFields, email: e.target.value })
            }
            value={signInFields.email}
            autoComplete="username"
            disabled={loading}
          />
        </div>

        <div className="grid gap-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <Link
              href="#"
              className={cn(
                "ml-auto inline-block text-xs underline",
                loading && "pointer-events-none opacity-50",
              )}
              aria-disabled={loading}
              tabIndex={loading ? -1 : 0}
            >
              Forgot your password?
            </Link>
          </div>

          <Input
            id="password"
            type="password"
            onChange={(e) =>
              setSignInFields({ ...signInFields, password: e.target.value })
            }
            value={signInFields.password}
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            onClick={() => {
              setSignInFields({
                ...signInFields,
                rememberMe: !signInFields.rememberMe,
              })
            }}
            disabled={loading}
          />
          <Label htmlFor="remember">Remember me</Label>
        </div>

        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          <p>Login</p>
        </Button>

        <SocialAuthButtons
          loading={loading}
          mode="sign-in"
          onSignInSocialClick={onSignInSocialClick}
        />
      </form>
    </AuthCard>
  )
}
