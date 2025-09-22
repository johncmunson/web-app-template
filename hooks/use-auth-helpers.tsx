"use client"

import { FormEvent, useState } from "react"
import { toast } from "sonner"
import {
  ErrorContext,
  RequestContext,
  ResponseContext,
} from "better-auth/react"
import { authClient } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"

// async function convertImageToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onloadend = () => resolve(reader.result as string)
//     reader.onerror = reject
//     reader.readAsDataURL(file)
//   })
// }

export function useAuthHelpers() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") || "/"
  const [loading, setLoading] = useState(false)
  const [signInFields, setSignInFields] = useState({
    email: "",
    password: "",
    rememberMe: false, // NOTE: See important comments at the bottom of this file about "Remember me" functionality
    callbackURL,
  })
  const signInStaticFields = {
    title: "Sign In",
    description: "Enter your email below to login to your account",
    // Preserve the callbackURL when navigating to sign up
    footerHref:
      callbackURL === "/" ? "/sign-up" : `/sign-up?callbackURL=${callbackURL}`,
    footerLinkText: "Sign up",
    footerText: "Don't have an account?",
  }
  const [signUpFields, setSignUpFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    // TODO: This field is not currently being used. However, there is commented out boilerplate
    // code in this file and in sign-up.tsx for allowing the user to set a profile image on sign
    // up with email/password. Please note that the Base64 strategy used in the commented out code
    // is likely not compatible with the better-auth session/cookie cache that we are using b/c the
    // encoded image string is too large to fit in the cookie. A different approach would be needed.
    // For social sign in, the profile image URL is saved on the account automatically by better-auth.
    image: "", // image ? await convertImageToBase64(image) : "",
    callbackURL,
  })
  const signUpStaticFields = {
    title: "Sign Up",
    description: "Enter your information to create an account",
    // Preserve the callbackURL when navigating to sign in
    footerHref:
      callbackURL === "/" ? "/sign-in" : `/sign-in?callbackURL=${callbackURL}`,
    footerLinkText: "Sign in",
    footerText: "Already have an account?",
  }

  const validateSignIn = () => {
    return (
      signInFields.email.trim() !== "" && signInFields.password.trim() !== ""
    )
  }

  const validateSignUp = () => {
    return (
      signUpFields.firstName.trim() !== "" &&
      signUpFields.lastName.trim() !== "" &&
      signUpFields.email.trim() !== "" &&
      signUpFields.password.trim() !== ""
    )
  }

  const validateSignUpPasswordsMatch = () => {
    return signUpFields.password === signUpFields.passwordConfirmation
  }

  const hooks = {
    onRequest: (_ctx: RequestContext) => setLoading(true),
    onResponse: (_ctx: ResponseContext) => setLoading(false),
    onError: (ctx: ErrorContext) => {
      setLoading(false)
      toast.error(ctx.error.message)
    },
  }

  const onSignInEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    if (!validateSignIn()) {
      toast.error("Please fill in all fields")
      return
    }

    await authClient.signIn.email(signInFields, hooks)
  }

  const onSignUpEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    if (!validateSignUp()) {
      toast.error("Please fill in all fields")
      return
    }
    if (!validateSignUpPasswordsMatch()) {
      toast.error("Passwords do not match")
      return
    }

    await authClient.signUp.email(
      {
        ...signUpFields,
        name: `${signUpFields.firstName} ${signUpFields.lastName}`,
      },
      {
        ...hooks,
        // NOTE: As opposed to signIn.email or signIn.social, where callbackURL is for where to redirect the
        // user immediately after sign in/sign up, in signUp.email the callbackURL is for where to redirect
        // the user after they verify their email (if email verification is enabled). So, for signUp.email,
        // we utilize both the callbackURL _and_ the onSuccess hook. When using signIn.social to sign up a
        // user, it doesn't behave the same way because the email is assumed to already be verified by the
        // social provider.
        onSuccess: (_ctx) => {
          router.push(callbackURL)
        },
      },
    )
  }

  const onSignInSocialClick = async (providerId: string) => {
    if (loading) return
    await authClient.signIn.social({ provider: providerId, callbackURL }, hooks)
  }

  return {
    loading,
    signInFields,
    signInStaticFields,
    signUpFields,
    signUpStaticFields,
    setSignInFields,
    setSignUpFields,
    onSignInEmailSubmit,
    onSignUpEmailSubmit,
    onSignInSocialClick,
  }
}

/**
 * REMEMBER ME FUNCTIONALITY - IMPORTANT NOTES FOR DEVELOPERS
 *
 * Better Auth's "Remember me" functionality controls session cookie persistence, but browser
 * behavior may not always match user expectations. Here's what you need to know:
 *
 * EXPECTED BEHAVIOR:
 * - rememberMe: true  → User stays logged in across browser restarts
 * - rememberMe: false → User gets logged out when browser is closed
 *
 * ACTUAL BROWSER BEHAVIOR:
 * When rememberMe=false, Better Auth sets session cookies (no Max-Age), which should expire
 * when the browser closes. However, modern browsers often restore session cookies due to:
 * - "Continue where you left off" settings
 * - Browser crash recovery
 * - Incomplete browser shutdowns (closing tabs vs. quitting the app)
 * - Mobile browser suspension rather than termination
 * - Being logged in to a browser profile and having sync features enabled
 *
 * This means users who uncheck "Remember me" might still appear logged in after returning,
 * which can be confusing and may not meet security expectations.
 *
 * POTENTIAL SOLUTION:
 *
 * EPHEMERAL SESSION TRACKING WITH DUAL STORAGE APPROACH:
 * The core principle is to use browser storage APIs that have different persistence
 * characteristics to track user intent and browser state:
 *
 * - sessionStorage: Cleared when browser truly closes (ephemeral sessions)
 * - localStorage: Persists across browser restarts (persistent sessions)
 * - Combination logic: Track which storage type should be authoritative
 *
 * Conceptual flow:
 * 1. On login, set markers in appropriate storage based on rememberMe choice
 * 2. On page load, check storage markers against active session state
 * 3. Force sign-out when storage indicates session should have expired
 * 4. Use client-side validators that run early in app initialization
 *
 * This approach leverages the fact that sessionStorage has more reliable
 * browser-close behavior than session cookies, while localStorage provides
 * the persistence needed for "remember me" functionality.
 *
 * IMPLEMENTATION CONSIDERATIONS:
 * - HttpOnly cookies cannot be read by JavaScript (security feature)
 * - Client-side session validation should use auth library APIs, not direct cookie access
 * - Storage markers need to be cleared on explicit sign-out to prevent conflicts
 * - Consider edge cases like manual storage clearing or multiple tabs
 */
