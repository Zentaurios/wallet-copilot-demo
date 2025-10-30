"use server";

import { cookies } from "next/headers";
import { thirdwebAuth } from "@/lib/auth";
import type { VerifyLoginPayloadParams } from "thirdweb/auth";

const JWT_COOKIE_NAME = "tw_auth_token";

/**
 * Generate a login payload for the client to sign
 */
export async function generatePayload(address: string) {
  try {
    const payload = await thirdwebAuth.generatePayload({
      address,
    });
    return payload;
  } catch (error) {
    console.error("[Server] Error generating payload:", error);
    throw new Error("Failed to generate login payload");
  }
}

/**
 * Verify the signed payload and generate a JWT
 */
export async function login(params: VerifyLoginPayloadParams) {
  try {    
    // Verify the payload and signature
    const verifiedPayload = await thirdwebAuth.verifyPayload(params);
    
    // Check if verification was successful
    if (!verifiedPayload.valid) {
      console.log("[Server] Payload verification failed:", verifiedPayload.error);
      throw new Error(verifiedPayload.error);
    }
    
    // Generate JWT - pass the entire verifiedPayload object
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });

    // Set the JWT as an HTTP-only cookie
    const cookieStore = await cookies();
    
    cookieStore.set(JWT_COOKIE_NAME, jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    
    // Verify cookie was set
    const setCookie = cookieStore.get(JWT_COOKIE_NAME);
    
    return { success: true };
  } catch (error) {
    console.error("[Server] Error during login:", error);
    if (error instanceof Error) {
      console.error("[Server] Error message:", error.message);
      console.error("[Server] Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Check if the user is logged in by verifying the JWT
 */
export async function isLoggedIn(address: string) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get(JWT_COOKIE_NAME)?.value;

    if (!jwt) {
      console.log("[Server] No JWT cookie found");
      return false;
    }
    
    // Verify the JWT
    const result = await thirdwebAuth.verifyJWT({ jwt });
    console.log("[Server] JWT verification result:", JSON.stringify(result, null, 2));

    if (!result.valid) {
      console.log("[Server] JWT is invalid");
      return false;
    }

    // Check if the JWT is for the correct address
    const matches = result.parsedJWT.sub?.toLowerCase() === address.toLowerCase();
    return matches;
  } catch (error) {
    console.error("[Server] Error checking login status:", error);
    return false;
  }
}

/**
 * Log out the user by clearing the JWT cookie
 */
export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(JWT_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error("[Server] Error during logout:", error);
    throw new Error("Failed to logout");
  }
}

/**
 * Get the current authenticated user
 */
export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get(JWT_COOKIE_NAME)?.value;

    if (!jwt) {
      console.log("[Server] No JWT cookie found");
      return null;
    }    
    // Verify the JWT
    const result = await thirdwebAuth.verifyJWT({ jwt });

    if (!result.valid || !result.parsedJWT.sub) {
      console.log("[Server] JWT invalid or no subject");
      return null;
    }

    return {
      address: result.parsedJWT.sub,
      iat: result.parsedJWT.iat,
      exp: result.parsedJWT.exp,
    };
  } catch (error) {
    console.error("[Server] Error getting authenticated user:", error);
    return null;
  }
}
