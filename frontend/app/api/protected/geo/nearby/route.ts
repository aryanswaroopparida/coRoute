import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/redis/connect";

const SLOT_SIZE = 600;

function normalizeSlot(slotUnix: number) {
  return Math.floor(slotUnix / SLOT_SIZE) * SLOT_SIZE;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const latitude = searchParams.get("lat");
    const longitude = searchParams.get("lng");
    const radius = searchParams.get("radius") || "5";
    const slot = searchParams.get("slot");
    const genderFilter = searchParams.get("genderFilter") || "any";

    if (!latitude || !longitude || !slot) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const slotUnix = normalizeSlot(Number(slot));
    const geoKey = `geo:${slotUnix}`;

    const users = (await redis.georadius(
      geoKey,
      Number(longitude),
      Number(latitude),
      Number(radius),
      "km",
    )) as string[];

    if (!users.length) {
      return NextResponse.json({ users: [] });
    }

    // If no filtering needed
    if (genderFilter === "any") {
      return NextResponse.json({ users });
    }

    // Fetch genders in batch
    const genders = await redis.hmget("user:gender", ...users);

    const filteredUsers = users.filter(
      (userId, index) => genders[index] === genderFilter,
    );

    return NextResponse.json({
      users: filteredUsers,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
