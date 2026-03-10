import Room from "@/app/models/Room";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { userA, userB } = await req.json();

  const participants = [userA, userB].sort();

  let room = await Room.findOne({
    type: "personal",
    participants,
  });

  if (!room) {
    room = await Room.create({
      type: "personal",
      participants,
    });
  }

  return NextResponse.json({ room });
}
