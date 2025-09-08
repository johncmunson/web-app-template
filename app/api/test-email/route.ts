import { NextRequest, NextResponse } from "next/server"
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendCustomEmail,
  sendTextEmail,
} from "@/lib/email-services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, name } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = { email, name: name || "Test User" }
    let result

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(user)
        break

      case "verification":
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=test-token-123`
        result = await sendVerificationEmail(user, verificationUrl)
        break

      case "password-reset":
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=test-token-456`
        result = await sendPasswordResetEmail(user, resetUrl)
        break

      case "custom-html":
        result = await sendCustomEmail({
          to: email,
          subject: "Custom HTML Test Email",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
              <h1 style="color: #333;">Custom HTML Email</h1>
              <p>Hello <strong>${name || "there"}</strong>,</p>
              <p>This is a test email with custom HTML content.</p>
              <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #666;">This email was sent using Resend in development mode.</p>
              </div>
              <p>Best regards,<br>The Test Team</p>
            </div>
          `,
          text: `Hello ${name || "there"}, this is a test email with custom HTML content. This email was sent using Resend in development mode. Best regards, The Test Team`,
        })
        break

      case "text":
        result = await sendTextEmail({
          to: email,
          subject: "Plain Text Test Email",
          text: `Hello ${name || "there"},

This is a plain text test email sent using Resend.

This email was sent in development mode.

Best regards,
The Test Team`,
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 },
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully`,
        data: result.data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Test email API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

// GET endpoint to return available test email types
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      "welcome",
      "verification",
      "password-reset",
      "custom-html",
      "text",
    ],
    usage: {
      method: "POST",
      body: {
        type: "one of the available types",
        email: "recipient email address",
        name: "recipient name (optional)",
      },
    },
    note: "In development, emails are sent to Resend test addresses with labels",
  })
}
