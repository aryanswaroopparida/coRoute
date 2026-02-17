import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import configMap from "./config/config";

const JWT_SECRET = configMap.jwtSecret!;

export function proxy(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Add user info to headers or something, but for now, just verify
    const response = NextResponse.next();
    response.headers.set("x-user-id", decoded.userId);
    response.headers.set("x-user-role", decoded.role);
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
};
