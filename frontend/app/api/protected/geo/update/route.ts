import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/redis/connect";

export async function POST(req: NextRequest) {
  try {
    const { userId, latitude, longitude } = await req.json();

    if (!userId || !latitude || !longitude) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // GEOADD key longitude latitude member
    await redis.geoadd("geo:users", longitude, latitude, userId);

    return NextResponse.json({
      success: true,
      message: "Location updated",
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
