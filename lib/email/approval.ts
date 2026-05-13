import { resend, AUDIENCE_ID, FROM_ADDRESS } from "./client";

/**
 * Send an approval email to an organization that has been approved.
 */
export async function sendApprovalEmail(
  email: string,
  firstName?: string,
): Promise<void> {
  // Send approval email
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `You're Approved! Start Building with Stridify`,
      html: buildApprovalHtml(firstName),
      text: buildApprovalText(firstName),
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@stridify.app>`,
      },
    });
    if (error) {
      console.error(
        `[email] failed to send approval email to ${email}:`,
        error,
      );
    } else {
      console.log(`[email] approval email sent to ${email}`);
    }
  } catch (err) {
    console.error(`[email] approval email error for ${email}:`, err);
  }
}

function buildApprovalText(firstName?: string): string {
  const name = firstName || "there";
  return `Hi ${name},

Great news! Your Stridify account has been approved for beta access.

You now have full access to build, test, and deploy AI powered voice agents. No coding required, just describe what you want your agent to do and watch it come to life.

Here's how to get started:

1. Log in to your dashboard. Access your account and enter your prompt.
2. Create your first agent. Build web, telephony, or embed widgets with a custom prompt.
3. Preview and deploy. Test your agent and share it with the world when ready.

Ready to build?
https://stridify.app

Welcome to the Stridify community!

The Stridify Team`;
}

function buildApprovalHtml(firstName?: string): string {
  const name = firstName || "there";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Account Approved - Stridify</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                You're Approved!
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
                Hi ${name},
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
                Great news! Your Stridify account has been approved for beta access.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
                You now have full access to build, test, and deploy AI powered voice agents. No coding required, just describe what you want your agent to do and watch it come to life.
              </p>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;font-weight:600;">
                Here's how to get started:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                    <strong style="color:#18181b;">1.</strong> Log in to your dashboard. Access your account and enter your prompt.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                    <strong style="color:#18181b;">2.</strong> Create your first agent. Build web, telephony, or embed widgets with a custom prompt.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                    <strong style="color:#18181b;">3.</strong> Preview and deploy. Test your agent and share it with the world when ready.
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;font-weight:600;">
                Ready to build?
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#3f3f46;">
                <a href="https://stridify.app" target="_blank" style="color:#18181b;text-decoration:none;font-weight:600;">https://stridify.app</a>
              </p>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#71717a;">
                Questions? We're here to help. Just reply to this email and we'll get back to you quickly.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0;" />
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#a1a1aa;line-height:1.5;">
                Welcome to the Stridify community!
              </p>
              <p style="margin:0 0 12px;font-size:13px;color:#a1a1aa;line-height:1.5;">
                The Stridify Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
