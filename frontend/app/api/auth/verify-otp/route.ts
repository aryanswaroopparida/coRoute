import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { redis } from "@/app/redis/connect";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  const otpKey = `otp:${email}`;

  const stored = await redis.get(otpKey);

  if (!stored) {
    return NextResponse.json(
      { message: "OTP expired or not found" },
      { status: 400 },
    );
  }

  const parsed = JSON.parse(stored);

  if (parsed.attempts >= MAX_ATTEMPTS) {
    await redis.del(otpKey);
    return NextResponse.json(
      { message: "Too many attempts. Request new OTP." },
      { status: 429 },
    );
  }

  const isMatch = await bcrypt.compare(otp, parsed.otp);

  if (!isMatch) {
    parsed.attempts += 1;

    await redis.set(otpKey, JSON.stringify(parsed), "KEEPTTL");

    return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
  }

  // OTP correct → delete OTP key
  await redis.del(otpKey);

  // Mark email verified for signup
  await redis.set(
    `verified:${email}`,
    "true",
    "EX",
    900, // 15 minutes
  );

  return NextResponse.json({ message: "Email verified" });
}
