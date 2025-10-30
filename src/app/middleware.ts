import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { thirdwebAuth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to dynamic address routes (format: /0x...)
  const addressMatch = pathname.match(/^\/0x[a-fA-F0-9]{40}$/);
  
  if (!addressMatch) {
    return NextResponse.next();
  }

  const addressFromUrl = pathname.slice(1); // Remove leading '/'
  const jwt = request.cookies.get("tw_auth_token")?.value;

  // No JWT = not authenticated
  if (!jwt) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }

  try {
    // Verify JWT
    const result = await thirdwebAuth.verifyJWT({ jwt });

    // If the JWT is invalid, redirect
    if (!result.valid) {
      return NextResponse.redirect(new URL("/?auth=invalid", request.url));
    }

    const parsedJWT = result.parsedJWT;

    if (!parsedJWT?.sub) {
      return NextResponse.redirect(new URL("/?auth=invalid", request.url));
    }

    const authenticatedAddress = parsedJWT.sub.toLowerCase();
    const requestedAddress = addressFromUrl.toLowerCase();

    // Check if authenticated address matches the URL address
    if (authenticatedAddress !== requestedAddress) {
      // User is authenticated but trying to access another wallet's page
      return NextResponse.redirect(
        new URL(`/${authenticatedAddress}`, request.url)
      );
    }

    // All checks passed - allow access
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/?auth=error", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths that start with /0x (wallet addresses)
     * Exclude API routes, static files, and Next.js internals
     */
    "/(0x[a-fA-F0-9]{40}.*)",
  ],
};
