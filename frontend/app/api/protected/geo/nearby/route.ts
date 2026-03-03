import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/redis/connect";
import dbConnect from "@/app/db/dbConnect";
import User from "@/app/models/User";

const SLOT_SIZE = 600;

function normalizeSlot(slotUnix: number) {
  return Math.floor(slotUnix / SLOT_SIZE) * SLOT_SIZE;
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

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

    const slotsToCheck: number[] = [requestedSlot];

    if (requestedSlot > currentSlot) {
      const prevSlot = requestedSlot - SLOT_SIZE;
      if (prevSlot >= currentSlot) {
        slotsToCheck.push(prevSlot);
      }
      slotsToCheck.push(requestedSlot + SLOT_SIZE);
    }

    if (requestedSlot === currentSlot) {
      slotsToCheck.push(requestedSlot + SLOT_SIZE);
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

      let filteredUsers = users;

      if (genderFilter !== "any") {
        const genders = await redis.hmget("user:gender", ...users);
        filteredUsers = users.filter(
          (userId, index) => genders[index] === genderFilter,
        );
      }

      if (!filteredUsers.length) continue;

      // 🔥 Fetch names from MongoDB in batch
      const dbUsers = await User.find(
        { email: { $in: filteredUsers } },
        { name: 1, email: 1 },
      ).lean();

      // Map by email for fast lookup
      const userMap = new Map(dbUsers.map((u) => [u.email.toLowerCase(), u]));

      const formattedUsers = filteredUsers
        .map((email) => {
          const user = userMap.get(email.toLowerCase());
          if (!user) return null;

          return {
            email: user.email,
            name: user.name,
          };
        })
        .filter(Boolean);

      return NextResponse.json({
        users: formattedUsers,
        matchedSlot: slotUnix,
      });
    }

    return NextResponse.json({ users: [] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
