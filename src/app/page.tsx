"use client";

import { ConnectWallet } from "@/components/connect-wallet";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getAuthenticatedUser } from "@/app/actions/auth";

function HomeContent() {
  const account = useActiveAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAndRedirect() {
      console.log("Homepage - Checking redirect...", { mounted, account: account?.address });
      
      if (!mounted || !account) {
        setIsChecking(false);
        return;
      }

      const user = await getAuthenticatedUser();
      console.log("Homepage - Auth user:", user);
      
      if (user && user.address) {
        // User is authenticated, redirect to their dashboard
        console.log("Homepage - Redirecting to:", `/${user.address}`);
        router.replace(`/${user.address}`);
      } else {
        console.log("Homepage - No auth user, staying on homepage");
        setIsChecking(false);
      }
    }

    checkAndRedirect();
  }, [account, router, mounted]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-tw-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary-text text-sm sm:text-base">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-6 sm:space-y-8 w-full">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight px-4">
            <span className="bg-gradient-to-r from-tw-primary via-tw-secondary to-tw-accent bg-clip-text text-transparent">
              Wallet Copilot
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-secondary-text max-w-2xl mx-auto leading-relaxed px-4">
            Your AI-powered blockchain assistant. Connect your wallet and start
            chatting to manage your crypto with natural language.
          </p>
        </div>

        {/* Connect Button & GitHub Link */}
        <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4">
          <ConnectWallet />
          
          <a
            href="https://github.com/Zentaurios/wallet-copilot-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-hover rounded-full px-4 sm:px-6 py-2.5 text-xs sm:text-sm border border-border flex items-center gap-2 hover:border-tw-primary/50 transition-colors group w-full sm:w-auto justify-center"
          >
            <svg 
              className="w-4 sm:w-5 h-4 sm:h-5 text-secondary-text group-hover:text-tw-primary transition-colors" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="text-secondary-text group-hover:text-foreground transition-colors">
              View on GitHub
            </span>
            <svg 
              className="w-3 sm:w-4 h-3 sm:h-4 text-secondary-text group-hover:text-tw-primary transition-colors hidden sm:block" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl w-full">
        <div className="glass-hover rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-tw-primary/30 to-tw-primary/10 flex items-center justify-center text-2xl sm:text-3xl border border-tw-primary/20 group-hover:scale-110 transition-transform duration-200">
            💬
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">AI Chat Interface</h3>
          <p className="text-sm sm:text-base text-secondary-text leading-relaxed">
            Natural language commands for all your blockchain operations
          </p>
        </div>

        <div className="glass-hover rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-tw-secondary/30 to-tw-secondary/10 flex items-center justify-center text-2xl sm:text-3xl border border-tw-secondary/20 group-hover:scale-110 transition-transform duration-200">
            👛
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Live Wallet View</h3>
          <p className="text-sm sm:text-base text-secondary-text leading-relaxed">
            Real-time balance, tokens, and transaction history
          </p>
        </div>

        <div className="glass-hover rounded-xl sm:rounded-2xl p-6 sm:p-8 space-y-3 sm:space-y-4 group sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-tw-accent/30 to-tw-accent/10 flex items-center justify-center text-2xl sm:text-3xl border border-tw-accent/20 group-hover:scale-110 transition-transform duration-200">
            ⚡
          </div>
          <h3 className="text-lg sm:text-xl font-semibold">Smart Transactions</h3>
          <p className="text-sm sm:text-base text-secondary-text leading-relaxed">
            Preview and confirm transactions before they execute
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-12 sm:mt-16 flex flex-col items-center gap-4">
        <div className="glass rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm border border-border">
          <span className="text-secondary-text">Powered by </span>
          <span className="text-tw-primary font-semibold">thirdweb</span>
          <span className="text-secondary-text hidden sm:inline"> • </span>
          <span className="text-secondary-text hidden sm:inline">Built with </span>
          <span className="text-tw-accent font-semibold hidden sm:inline">Next.js 15</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-tw-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary-text text-sm sm:text-base">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
