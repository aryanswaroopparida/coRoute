import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/redis/connect";

const SLOT_SIZE = 600;

function normalizeSlot(slotUnix: number) {
  return Math.floor(slotUnix / SLOT_SIZE) * SLOT_SIZE;
}

function validateSlot(slotUnix: number) {
  const now = Math.floor(Date.now() / 1000);
  const normalized = normalizeSlot(slotUnix);

  if (normalized < now - SLOT_SIZE) {
    throw new Error("Slot is in the past");
  }

  // const maxFuture = now + 24 * 60 * 60;
  // if (normalized > maxFuture) {
  //   throw new Error("Slot too far in future");
  // }

  return normalized;
}

export async function POST(req: NextRequest) {
  try {
    const { userId, latitude, longitude, slot } = await req.json();

    if (!userId || !latitude || !longitude || !slot) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const slotUnix = validateSlot(Number(slot));
    const geoKey = `geo:${slotUnix}`;

    await redis.geoadd(geoKey, Number(longitude), Number(latitude), userId);

    // TTL until slot time + 20 min buffer
    const now = Math.floor(Date.now() / 1000);
    const ttl = slotUnix - now + 1200;

    if (ttl > 0) {
      await redis.expire(geoKey, ttl);
    }

    return NextResponse.json({
      success: true,
      message: "User added to slot",
      slot: slotUnix,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
