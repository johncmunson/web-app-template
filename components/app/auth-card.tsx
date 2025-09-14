import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import Link from "next/link"

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
  footerText: string
  footerLinkText: string
  footerHref: string
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthCardProps) {
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">{children}</div>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm">
          {footerText}{" "}
          <Link href={footerHref} className="underline">
            {footerLinkText}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
