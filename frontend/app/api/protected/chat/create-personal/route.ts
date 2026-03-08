import Room from "@/app/models/Room";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userA, userB } = await req.json();

  let room = await Room.findOne({
    type: "personal",
    participants: { $all: [userA, userB] },
  });

  if (!room) {
    room = await Room.create({
      type: "personal",
      participants: [userA, userB],
    });
  }

  return NextResponse.json({ room });
}
