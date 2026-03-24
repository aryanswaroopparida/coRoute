import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/db/dbConnect";
import Room from "@/app/models/Room";
import User from "@/app/models/User";
import { tsToIST12hr } from "@/app/utils/date";

interface RoomDocument {
  type: "group" | "personal";
  slot?: number;
  participants: string[];
  createdAt: Date;
  expiresAt?: Date;
}

interface UserDocument {
  name: string;
  email: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    await dbConnect();

    const { roomId } = await params; // ✅ await params (Next.js 15)

    const room = await Room.findById(roomId).lean<RoomDocument>();

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Fetch user details for all participant emails
    const users = await User.find(
      { email: { $in: room.participants } },
      { name: 1, email: 1, _id: 0 },
    ).lean<UserDocument[]>();

    // Build name from slot (group) or participant emails (personal)
    const name: string =
      room.type === "group"
        ? `Group • Slot ${tsToIST12hr(room.slot as number)}`
        : "Personal Chat";

    return NextResponse.json({
      name,
      participants: users, // [{ email, name }]
    });
  } catch (error) {
    console.error("[ROOM_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
