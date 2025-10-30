import { createAuth } from "thirdweb/auth";
import { createThirdwebClient } from "thirdweb";
import { privateKeyToAccount } from "thirdweb/wallets";

if (!process.env.THIRDWEB_SECRET_KEY) {
  throw new Error("Missing THIRDWEB_SECRET_KEY");
}

if (!process.env.THIRDWEB_ADMIN_PRIVATE_KEY) {
  throw new Error("Missing THIRDWEB_ADMIN_PRIVATE_KEY");
}

// Create a server-side client with secret key
const thirdwebClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY,
});

// Create admin account from private key (used for signing JWTs)
const adminAccount = privateKeyToAccount({
  client: thirdwebClient,
  privateKey: process.env.THIRDWEB_ADMIN_PRIVATE_KEY,
});

// Create and export the auth instance
export const thirdwebAuth = createAuth({
  domain: process.env.NEXT_PUBLIC_APP_URL || "wallet-copilot-demo.vercel.app",
  client: thirdwebClient,
  adminAccount,
});
