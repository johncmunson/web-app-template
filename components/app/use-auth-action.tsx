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

export function useAuthAction() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackURL = searchParams.get("callbackURL") || "/"
  const [loading, setLoading] = useState(false)
  const [signInFields, setSignInFields] = useState({
    email: "",
    password: "",
    rememberMe: false,
    callbackURL,
  })
  const signInStaticFields = {
    title: "Sign In",
    description: "Enter your email below to login to your account",
    // Preserve the callbackURL when navigating to sign up
    footerHref: callbackURL
      ? `/sign-up?callbackURL=${callbackURL}`
      : "/sign-up",
    footerLinkText: "Sign up",
    footerText: "Don't have an account?",
  }
  const [signUpFields, setSignUpFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    image: "", // image ? await convertImageToBase64(image) : "",
    callbackURL,
  })
  const signUpStaticFields = {
    title: "Sign Up",
    description: "Enter your information to create an account",
    // Preserve the callbackURL when navigating to sign in
    footerHref: callbackURL
      ? `/sign-in?callbackURL=${callbackURL}`
      : "/sign-in",
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
        // user immediately after sign up/sign in, in signUp.email the callbackURL is for where to redirect
        // the user after they verify their email (if email verification is enabled). So, for signUp.email,
        // we utilize both the callbackURL _and_ the onSuccess hook. signUp.social does not behave this way
        // because the email is assumed to be verified by the social provider.
        onSuccess: (_ctx) => {
          router.push(callbackURL || "/")
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
    hooks,
    signInFields,
    signInStaticFields,
    setSignInFields,
    validateSignIn,
    signUpFields,
    signUpStaticFields,
    setSignUpFields,
    validateSignUp,
    onSignInEmailSubmit,
    onSignUpEmailSubmit,
    onSignInSocialClick,
  }
}
