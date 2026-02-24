export function generateOTPEmailTemplate(userName: string, otp: string) {
  const subject = "Your CoRoute Verification Code";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>CoRoute Email Verification</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
            
            <tr>
              <td align="center" style="font-size:24px;font-weight:700;color:#111;">
                🚀 CoRoute
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top:8px;font-size:16px;color:#666;">
                Email Verification Code
              </td>
            </tr>

            <tr>
              <td style="padding-top:25px;font-size:15px;color:#444;">
                Hi <strong>${userName}</strong>,
              </td>
            </tr>

            <tr>
              <td style="padding-top:15px;font-size:14px;color:#555;line-height:1.6;">
                To complete your sign-up, enter the verification code below.
                This code will expire in <strong>10 minutes</strong>.
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:30px 0;">
                <div style="
                  font-size:34px;
                  letter-spacing:10px;
                  font-weight:700;
                  color:#2563eb;
                  background:#f1f5f9;
                  padding:18px 28px;
                  border-radius:10px;
                  display:inline-block;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td style="font-size:13px;color:#777;line-height:1.6;text-align:center;">
                If you didn’t request this code, you can safely ignore this email.
              </td>
            </tr>

            <tr>
              <td style="padding-top:35px;font-size:12px;color:#aaa;text-align:center;">
                © ${new Date().getFullYear()} CoRoute. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const text = `
CoRoute - Email Verification

Hi ${userName},

Your verification code is:

${otp}

This code will expire in 10 minutes.

If you did not request this, you can ignore this email.

© ${new Date().getFullYear()} CoRoute
`;

  return { subject, html, text };
}
