"use client";

import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { thirdwebTheme } from "@/lib/theme";
import { generatePayload, login, isLoggedIn, logout } from "@/app/actions/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";

export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const account = useActiveAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[50px] w-[165px] rounded-lg bg-white/5 animate-pulse" />
    );
  }

  return (
    <ConnectButton
      client={client}
      theme={thirdwebTheme}
      auth={{
        isLoggedIn: async (address) => {
          console.log("ConnectWallet - Checking if logged in:", address);
          const result = await isLoggedIn(address);
          console.log("ConnectWallet - isLoggedIn result:", result);
          return result;
        },
        doLogin: async (params) => {
          console.log("ConnectWallet - doLogin called");
          try {
            const result = await login(params);
            console.log("ConnectWallet - login result:", result);
            
            // After successful login, redirect to the wallet dashboard
            if (result.success && params.payload.address) {
              console.log("ConnectWallet - Redirecting to dashboard:", params.payload.address);
              // Small delay to ensure cookie is set
              setTimeout(() => {
                router.push(`/${params.payload.address}`);
              }, 100);
            }
          } catch (error) {
            console.error("ConnectWallet - login error:", error);
            throw error;
          }
        },
        getLoginPayload: async ({ address }) => {
          console.log("ConnectWallet - getLoginPayload for:", address);
          const payload = await generatePayload(address);
          console.log("ConnectWallet - payload generated");
          return payload;
        },
        doLogout: async () => {
          console.log("ConnectWallet - doLogout called");
          await logout();
          // Redirect to homepage after logout
          router.push("/");
        },
      }}
    />
  );
}
