import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "../../../models/User";
import dbConnect from "../../../db/dbConnect";
import { redis } from "@/app/redis/connect";
import jwt from "jsonwebtoken";
import configMap from "@/config/config";

const JWT_SECRET = configMap.jwtSecret!;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, gender } = await request.json();

    if (!name || !email || !password || !gender) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["girls", "boys"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender value" },
        { status: 400 },
      );
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in MongoDB
    let user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      gender,
    });

    user = await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" },
    );

    // Store gender in Redis for fast geo filtering
    await redis.hset("user:gender", email.toLowerCase(), gender);

    const response = NextResponse.json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true, // Prevent JS access
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/", // Available across app
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
