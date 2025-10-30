"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import { getAuthenticatedUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export function Dashboard() {
  const account = useActiveAccount();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<{ address: string; exp?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      const user = await getAuthenticatedUser();
      console.log("Dashboard - Auth check result:", user);
      setAuthUser(user);
      setLoading(false);
    }
    if (mounted) {
      checkAuth();
    }
  }, [account, mounted]);

  const handleEnterDashboard = () => {
    if (authUser?.address) {
      console.log("Navigating to:", `/${authUser.address}`);
      router.push(`/${authUser.address}`);
    }
  };

  if (!mounted) {
    return (
      <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="h-8 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
        <p className="text-center text-secondary-text">
          Please connect your wallet to continue
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
        <p className="text-center text-secondary-text">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">🎉 Welcome!</h2>
        <p className="text-secondary-text">
          {authUser 
            ? "You are authenticated and ready to use Wallet Copilot" 
            : "Please sign in to authenticate"}
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-border">
          <p className="text-sm text-secondary-text mb-1">Connected Address</p>
          <p className="font-mono text-sm break-all">{account.address}</p>
        </div>

        {authUser && (
          <>
            <div className="p-4 rounded-xl bg-white/5 border border-border">
              <p className="text-sm text-secondary-text mb-1">Authentication Status</p>
              <p className="text-green-400 font-semibold">✓ Authenticated</p>
            </div>

            {authUser.exp && (
              <div className="p-4 rounded-xl bg-white/5 border border-border">
                <p className="text-sm text-secondary-text mb-1">Session Expires</p>
                <p className="text-sm">
                  {new Date(authUser.exp * 1000).toLocaleString()}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {authUser && (
        <div className="pt-4 space-y-4">
          <button
            onClick={handleEnterDashboard}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-tw-primary to-tw-secondary hover:opacity-90 transition-opacity font-semibold text-center"
          >
            Enter Dashboard →
          </button>
          <p className="text-sm text-secondary-text text-center">
            Click to access your personalized wallet dashboard
          </p>
        </div>
      )}
    </div>
  );
}
