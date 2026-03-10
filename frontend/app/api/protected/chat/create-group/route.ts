import Room from "@/app/models/Room";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { slot, participants } = await req.json();

  let room = await Room.findOne({
    type: "group",
    slot,
  });

  if (!room) {
    room = await Room.create({
      type: "group",
      slot,
      participants,
    });
  } else {
    await Room.updateOne(
      { _id: room._id },
      { $addToSet: { participants: { $each: participants } } },
    );

    room = await Room.findById(room._id);
  }

  return NextResponse.json({ room });
}
