---
applyTo: "_______NOTHING_______"
---

# What email addresses to use for testing?

> Learn what email addresses are safe to use for testing with Resend

## Safe email addresses for testing

When testing email functionality, it's important to use designated test addresses to avoid unintended consequences like deliverability issues or spam complaints.

Resend provides a set of safe email addresses specifically designed for testing, ensuring that you can simulate different email events without affecting your domain's reputation.

### Why not use @example.com or @test.com?

Many developers attempt to use domains like `@example.com` or `@test.com` for testing purposes. However, these domains are not designed for email traffic and often reject messages, leading to bounces.

A high bounce rate can negatively impact your sender reputation and affect future deliverability. To prevent this, Resend blocks such addresses and returns a `422 Unprocessable Entity` error if you attempt to send to them.

### List of addresses to use

To help you safely test email functionality, Resend provides the following test addresses, each designed to simulate a different delivery event:

| Address                | Delivery event simulated |
| ---------------------- | ------------------------ |
| `delivered@resend.dev` | Email being delivered    |
| `bounced@resend.dev`   | Email bouncing           |

Using these addresses in your tests allows you to validate email flows without risking real-world deliverability problems. For more help sending test emails, see our [testing documentation](/dashboard/emails/send-test-emails).

Whether you need to confirm that an email has been sent, track engagement events, or simulate a bounce scenario, these addresses provide a controlled and predictable way to test your email integration with Resend.
