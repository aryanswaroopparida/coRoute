import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/db/dbConnect";
import User from "@/app/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const email = request.headers.get("x-email-id");

    if (!email) {
      return NextResponse.json(
        { error: "Email query param is required" },
        { status: 400 },
      );
    }

    // Exclude password at DB level
    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { profile } = await request.json();

    const email = request.headers.get("x-email-id");

    if (!email) {
      return NextResponse.json(
        { error: "Email query param is required" },
        { status: 400 },
      );
    }

    // Exclude password at DB level
    const user = await User.findOneAndUpdate(
      { email },
      { profilepic: profile },
      { new: true, select: "-password" }, // 'new: true' returns the updated user, '-password' hides the hash
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();
    const user = await User.findOne(email);
    return NextResponse.json({ user });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
