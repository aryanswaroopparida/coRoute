import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/redis/connect";
import dbConnect from "@/app/db/dbConnect";
import User from "@/app/models/User";

const SLOT_SIZE = 600;

function normalizeSlot(slotUnix: number) {
  return Math.floor(slotUnix / SLOT_SIZE) * SLOT_SIZE;
}

function addFutureSlots(baseSlot: number, futureSlots: number) {
  const slots: number[] = [];
  for (let i = 1; i <= futureSlots; i++) {
    slots.push(baseSlot + i * SLOT_SIZE);
  }
  return slots;
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
    const futureSlots = Number(searchParams.get("futureSlots") || "0");

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

    if (futureSlots > 0) {
      slotsToCheck.push(...addFutureSlots(requestedSlot, futureSlots));
    }

    // ---------- REDIS PIPELINE ----------
    const pipeline = redis.pipeline();

    for (const slotUnix of slotsToCheck) {
      const geoKey = `geo:${slotUnix}`;

      pipeline.georadius(
        geoKey,
        Number(longitude),
        Number(latitude),
        Number(radius),
        "km",
      );
    }

    const results = await pipeline.exec();

    const allUsers: string[] = [];
    let matchedSlot: number | null = null;

    if (results === null)
      return NextResponse.json({
        users: allUsers,
        matchedSlot,
      });

    results.forEach((res, index) => {
      const users = res[1] as string[];

      if (!users || users.length === 0) return;

      if (!matchedSlot) matchedSlot = slotsToCheck[index];

      allUsers.push(...users);
    });

    const uniqueUsers = [...new Set(allUsers)];

    if (!uniqueUsers.length) {
      return NextResponse.json({ users: [] });
    }

    let filteredUsers = uniqueUsers;

    if (genderFilter !== "any") {
      const genders = await redis.hmget("user:gender", ...uniqueUsers);
      filteredUsers = uniqueUsers.filter(
        (userId, index) => genders[index] === genderFilter,
      );
    }

    const dbUsers = await User.find(
      { email: { $in: filteredUsers } },
      { name: 1, email: 1 },
    ).lean();

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
      matchedSlot,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
