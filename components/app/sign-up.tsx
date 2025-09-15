"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCard } from "./auth-card"
import { SocialAuthButtons } from "./social-auth-buttons"
import { useAuthAction } from "./use-auth-action"
// import Image from "next/image"

// async function convertImageToBase64(file: File): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()
//     reader.onloadend = () => resolve(reader.result as string)
//     reader.onerror = reject
//     reader.readAsDataURL(file)
//   })
// }

export default function SignUp() {
  const {
    loading,
    onSignUpEmailSubmit,
    signUpFields,
    setSignUpFields,
    signUpStaticFields,
    onSignInSocialClick,
  } = useAuthAction()

  // const [image, setImage] = useState<File | null>(null)
  // const [imagePreview, setImagePreview] = useState<string | null>(null)
  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (file) {
  //     setImage(file)
  //     const reader = new FileReader()
  //     reader.onloadend = () => {
  //       setImagePreview(reader.result as string)
  //     }
  //     reader.readAsDataURL(file)
  //   }
  // }

  return (
    <AuthCard
      title={signUpStaticFields.title}
      description={signUpStaticFields.description}
      footerText={signUpStaticFields.footerText}
      footerLinkText={signUpStaticFields.footerLinkText}
      footerHref={signUpStaticFields.footerHref}
      loading={loading}
    >
      <form
        aria-disabled={loading}
        className="grid gap-4"
        onSubmit={onSignUpEmailSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first-name">First name</Label>
            <Input
              id="first-name"
              onChange={(e) => {
                setSignUpFields({ ...signUpFields, firstName: e.target.value })
              }}
              value={signUpFields.firstName}
              autoComplete="given-name"
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last-name">Last name</Label>
            <Input
              id="last-name"
              onChange={(e) => {
                setSignUpFields({ ...signUpFields, lastName: e.target.value })
              }}
              value={signUpFields.lastName}
              autoComplete="family-name"
              disabled={loading}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            onChange={(e) => {
              setSignUpFields({ ...signUpFields, email: e.target.value })
            }}
            value={signUpFields.email}
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            onChange={(e) => {
              setSignUpFields({ ...signUpFields, password: e.target.value })
            }}
            value={signUpFields.password}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Confirm Password</Label>
          <Input
            id="password_confirmation"
            type="password"
            onChange={(e) => {
              setSignUpFields({
                ...signUpFields,
                passwordConfirmation: e.target.value,
              })
            }}
            value={signUpFields.passwordConfirmation}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        {/* <div className="grid gap-2">
            <Label htmlFor="image">Profile Image (optional)</Label>
            <div className="flex items-end gap-4">
              {imagePreview && (
                <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Profile preview"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
                {imagePreview && (
                  <X
                    className="cursor-pointer"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                  />
                )}
              </div>
            </div>
          </div> */}
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={loading}
        >
          Create an account
        </Button>

        <SocialAuthButtons
          loading={loading}
          mode="sign-up"
          onSignInSocialClick={onSignInSocialClick}
        />
      </form>
    </AuthCard>
  )
}
