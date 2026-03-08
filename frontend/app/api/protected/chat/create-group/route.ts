import Room from "@/app/models/Room";
import { NextRequest,NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { participants, slot } = await req.json();

  let room = await Room.findOne({
    type: "group",
    slot,
    participants: { $all: participants },
  });

  if (!room) {
    room = await Room.create({
      type: "group",
      slot,
      participants,
    });
  }

  return NextResponse.json({ room });
}
