import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/db/dbConnect";
import Room from "@/app/models/Room";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const email = req.headers.get("x-email-id");

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await Room.find({
      participants: email.toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .select("_id type slot participants createdAt")
      .lean();

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}
