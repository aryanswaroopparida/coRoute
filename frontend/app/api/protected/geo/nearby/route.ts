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

    const nowUnix = Math.floor(Date.now() / 1000);
    const currentSlot = normalizeSlot(nowUnix);

    const requestedSlot = normalizeSlot(Number(slot));

    // Build slots to check in order
    const slotsToCheck: number[] = [requestedSlot];

    // If requested slot is future slot
    if (requestedSlot > currentSlot) {
      const prevSlot = requestedSlot - SLOT_SIZE;
      if (prevSlot >= currentSlot) {
        slotsToCheck.push(prevSlot);
      }

      const nextSlot = requestedSlot + SLOT_SIZE;
      slotsToCheck.push(nextSlot);
    }

    // If requested slot is current slot (matchNow)
    if (requestedSlot === currentSlot) {
      const nextSlot = requestedSlot + SLOT_SIZE;
      slotsToCheck.push(nextSlot);
    }

    for (const slotUnix of slotsToCheck) {
      const geoKey = `geo:${slotUnix}`;

      const users = (await redis.georadius(
        geoKey,
        Number(longitude),
        Number(latitude),
        Number(radius),
        "km",
      )) as string[];

      if (!users.length) continue;

      if (genderFilter === "any") {
        return NextResponse.json({
          users,
          matchedSlot: slotUnix,
        });
      }

      const genders = await redis.hmget("user:gender", ...users);

      const filteredUsers = users.filter(
        (userId, index) => genders[index] === genderFilter,
      );

      if (filteredUsers.length > 0) {
        return NextResponse.json({
          users: filteredUsers,
          matchedSlot: slotUnix,
        });
      }
    }

    return NextResponse.json({ users: [] });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
