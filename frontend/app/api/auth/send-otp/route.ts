import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { redis } from "@/app/redis/connect";
import { generateOTP } from "@/app/utils/otp";
import { generateOTPEmailTemplate } from "@/app/utils/mailtemplate";
import { sendEmail } from "@/app/utils/mail";

const OTP_TTL = 600; // 10 minutes
const COOLDOWN_TTL = 60; // 1 minute

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();

  if (!email || !name) {
    return NextResponse.json(
      { message: "Name and email required" },
      { status: 400 },
    );
  }

  const cooldownKey = `otp:cooldown:${email}`;
  const otpKey = `otp:${email}`;

  // Prevent spamming
  const cooldownExists = await redis.get(cooldownKey);
  if (cooldownExists) {
    return NextResponse.json(
      { message: "Please wait before requesting another OTP." },
      { status: 429 },
    );
  }

  const otp = generateOTP(6);
  const hashedOtp = await bcrypt.hash(otp, 10);

  await redis.set(
    otpKey,
    JSON.stringify({
      otp: hashedOtp,
      attempts: 0,
    }),
    "EX",
    OTP_TTL,
  );

  // Set cooldown
  await redis.set(cooldownKey, "1", "EX", COOLDOWN_TTL);

  const { subject, html, text } = generateOTPEmailTemplate(name, otp);

  await sendEmail(email, subject, html, text);

  return NextResponse.json({ message: "OTP sent successfully" });
}
