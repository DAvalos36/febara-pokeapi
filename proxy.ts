import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { sessionCookie, verifySessionToken } from "@/lib/session";

const PUBLIC_ROUTES = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(sessionCookie.name)?.value,
  );

  if (session && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/coleccion", request.url));
  }

  if (!session && !PUBLIC_ROUTES.includes(pathname)) {
    const target = new URL("/login", request.url);

    target.searchParams.set("next", pathname);

    return NextResponse.redirect(target);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/coleccion/:path*",
    "/equipos/:path*",
    "/pokemon/:path*",
    "/login",
    "/registro",
  ],
};
