import { resend, AUDIENCE_ID, FROM_ADDRESS } from "./client";

/**
 * Add a new user as a contact to the broadcast audience,
 * then send a welcome email.
 */
export async function onboardNewUser(
  email: string,
  firstName?: string,
  lastName?: string,
): Promise<void> {
  // 1. Add contact to broadcast audience
  if (AUDIENCE_ID) {
    try {
      await resend.contacts.create({
        audienceId: AUDIENCE_ID,
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        unsubscribed: false,
      });
      console.log(`[email] added ${email} to broadcast audience`);
    } catch (err) {
      console.error(`[email] failed to add contact ${email}:`, err);
    }
  }

  // 2. Send welcome email
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: `Welcome to Stridify, ${firstName || "there"}!`,
      html: buildWelcomeHtml(firstName),
      text: buildWelcomeText(firstName),
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@stridify.app>`,
      },
    });
    if (error) {
      console.error(`[email] failed to send welcome email to ${email}:`, error);
    } else {
      console.log(`[email] welcome email sent to ${email}`);
    }
  } catch (err) {
    console.error(`[email] welcome email error for ${email}:`, err);
  }
}

function buildWelcomeText(firstName?: string): string {
  const name = firstName || "there";
  return `Hi ${name},

Welcome to Stridify, we're glad you're here.

Stridify helps you build, test, and deploy AI powered voice agents using simple prompts with o coding required.

Here's how to get started:

1. Create a project — Describe what you want your agent to do.
2. Preview it live — See and hear your agent in action instantly.
3. Deploy it — Share it with the world when you're ready.

Start building: https://stridify.app

If you have questions, reply to this email we read every message.

If you did not sign up for a Stridify account, please ignore this email no action is needed.

Happy building,
The Stridify Team`;
}

function buildWelcomeHtml(firstName?: string): string {
  const name = firstName || "there";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Stridify</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;text-align:center;">
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#18181b;line-height:1.3;">
                Welcome to Stridify
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
                Thanks for signing up. Stridify helps you build, test, and deploy AI powered voice agents using simple prompts with no coding required.
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#3f3f46;font-weight:600;">
                Get started in three steps:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                    <strong style="color:#18181b;">1.</strong> Create a project &mdash; Describe what your agent should do.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                    <strong style="color:#18181b;">2.</strong> Preview it live &mdash; See and hear your agent in action.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                    <strong style="color:#18181b;">3.</strong> Deploy it &mdash; Share it with the world when ready.
                  </td>
                </tr>
              </table>
              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#18181b;">
                    <a href="https://stridify.app" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                      Start Building
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#71717a;">
                If you have questions, just reply to this email we read every message.
              </p>
              <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#a1a1aa;">
                If you did not sign up for a Stridify account, please ignore this email no action is needed.
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
                Happy building,
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
