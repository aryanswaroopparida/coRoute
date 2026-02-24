import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465, // Use 465 for SSL
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL, // Replace with your email address
    pass: process.env.MAIL_APP_PASSWORD, // IMPORTANT: Use an environment variable for your password.
  },
});

/**
 * A generic function to send an email with any HTML content.
 * @param to The recipient's email address.
 * @param subject The subject line of the email.
 * @param htmlContent The HTML body of the email.
 * @param textContent A plain text version of the email for clients that don't render HTML.
 */

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
) {
  try {
    const info = await transporter.sendMail({
      from: `"CoRoute" <${process.env.EMAIL}>`, // Replace with your desired sender name and email
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.log(process.env.EMAIL, " ", process.env.MAIL_APP_PASSWORD);
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
}
