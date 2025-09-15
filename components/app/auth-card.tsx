import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
  footerText: string
  footerLinkText: string
  footerHref: string
  loading?: boolean
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLinkText,
  footerHref,
  loading = false,
}: AuthCardProps) {
  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
          {loading ? (
            <Loader2
              aria-label="Loading"
              className="h-4 w-4 animate-spin text-muted-foreground"
            />
          ) : null}
        </div>
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
          <Link
            href={footerHref}
            className={`underline ${loading ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={loading}
            tabIndex={loading ? -1 : 0}
          >
            {footerLinkText}
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
