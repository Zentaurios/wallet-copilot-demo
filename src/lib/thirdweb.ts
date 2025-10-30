import { createThirdwebClient } from "thirdweb";

if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
  throw new Error("Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID");
}

// Create thirdweb client for the app
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});
