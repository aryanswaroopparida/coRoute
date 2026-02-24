import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/redis/connect";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const latitude = searchParams.get("lat");
    const longitude = searchParams.get("lng");
    const radius = searchParams.get("radius") || "5"; // km default

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing coordinates" },
        { status: 400 },
      );
    }

    const users = await redis.georadius(
      "geo:users",
      Number(longitude),
      Number(latitude),
      Number(radius),
      "km",
    );

    return NextResponse.json({
      users,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
