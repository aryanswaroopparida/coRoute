import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import configMap from "@/config/config";

const JWT_SECRET = configMap.jwtSecret!;

const protectedRoutes = ["/dashboard", "/api/protected"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Optional: Forward user info to downstream routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
