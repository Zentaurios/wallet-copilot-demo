"use client";

import { useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { ChatInterface } from "@/components/chat-interface";
import { WalletInfoPanel } from "@/components/wallet-info-panel";
import { getAuthenticatedUser, logout } from "@/app/actions/auth";
import { toast } from "sonner";

function WalletDashboardContent() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const params = useParams();
  const addressFromUrl = params.address as string;

  const [isVerifying, setIsVerifying] = useState(true);
  const [showWalletPanel, setShowWalletPanel] = useState(false);
  const [walletPanelCollapsed, setWalletPanelCollapsed] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Ensure chat starts scrolled to top
  useEffect(() => {
    if (!isVerifying && chatScrollRef.current) {
      // Small delay to ensure this runs after any other scroll operations
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = 0;
        }
      }, 100);
    }
  }, [isVerifying]);

  useEffect(() => {
    async function verifyAccess() {
      console.log("WalletDashboard - Verifying access for:", addressFromUrl);

      // Check if user is connected
      if (!account) {
        console.log("WalletDashboard - No account, redirecting to home");
        router.replace("/?auth=required");
        return;
      }

      // Check if authenticated
      const user = await getAuthenticatedUser();
      console.log("WalletDashboard - Auth user:", user);
      
      if (!user) {
        console.log("WalletDashboard - Not authenticated, redirecting to home");
        router.replace("/?auth=required");
        return;
      }

      // Check if addresses match
      if (user.address.toLowerCase() !== addressFromUrl.toLowerCase()) {
        console.log("WalletDashboard - Address mismatch, redirecting to correct address");
        router.replace(`/${user.address}`);
        return;
      }

      console.log("WalletDashboard - Access verified!");
      setIsVerifying(false);
    }

    verifyAccess();
  }, [account, addressFromUrl, router]);

  const handleDisconnect = async () => {
    try {
      // First clear the auth session
      await logout();
      
      // Then disconnect the wallet if one is connected
      if (wallet) {
        disconnect(wallet);
      }
      
      toast.success("Disconnected successfully");
      router.push("/");
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Failed to disconnect");
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-tw-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary-text">Verifying access...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full overflow-hidden">
        <div className={`grid h-full grid-cols-1 transition-all duration-300 ${walletPanelCollapsed ? 'lg:grid-cols-[1fr_60px]' : 'lg:grid-cols-[1fr_380px]'}`}>
          {/* Chat Area - Left Side (scrollable) */}
          <div ref={chatScrollRef} className="flex flex-col h-full overflow-y-auto border-r border-border">
            {/* Top Navigation Bar - scrolls off screen with chat */}
            <div className="glass border-b border-border shrink-0">
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <h1 className="text-xl sm:text-2xl font-bold">
                    <span className="bg-gradient-to-r from-tw-primary via-tw-secondary to-tw-accent bg-clip-text text-transparent">
                      Wallet Copilot
                    </span>
                  </h1>
                  <div className="h-6 w-px bg-border hidden sm:block" />
                  <div className="items-center gap-2 hidden md:flex">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm text-secondary-text">Connected</span>
                  </div>
                </div>
                
                {/* Wallet Button */}
                <div className="flex items-center gap-2">
                  {/* GitHub Link */}
                  <a
                    href="https://github.com/Zentaurios/wallet-copilot-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg glass hover:bg-white/10 transition-colors group"
                    title="View on GitHub"
                  >
                    <svg 
                      className="w-5 h-5 text-secondary-text group-hover:text-tw-primary transition-colors" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-secondary-text">Wallet</span>
                    <span className="text-sm font-mono">
                      {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-3 sm:px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <ChatInterface />
          </div>

          {/* Wallet Info - Right Sidebar (Desktop) */}
          <div className="hidden lg:flex flex-col h-full overflow-hidden relative bg-[hsl(var(--background))]">
            {/* Collapse/Expand Button */}
            <button
              onClick={() => setWalletPanelCollapsed(!walletPanelCollapsed)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-8 h-16 glass rounded-lg hover:bg-white/10 transition-all flex items-center justify-center shadow-lg border border-border"
              title={walletPanelCollapsed ? "Expand wallet" : "Collapse wallet"}
            >
              <span className="text-secondary-text text-2xl font-light">
                {walletPanelCollapsed ? '‹' : '›'}
              </span>
            </button>
            
            {!walletPanelCollapsed && (
              <div key="expanded" className="flex-1 overflow-y-auto p-6 bg-[hsl(var(--background))] animate-fadeIn">
                <WalletInfoPanel />
              </div>
            )}
            
            {walletPanelCollapsed && (
              <div key="collapsed" className="flex-1 flex items-center justify-center p-2 animate-fadeIn">
                <div className="text-secondary-text text-sm font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  WALLET
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Wallet Panel Toggle Button */}
      <button
        onClick={() => setShowWalletPanel(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-tw-primary to-tw-secondary shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center text-2xl z-40"
      >
        👛
      </button>

      {/* Mobile Wallet Panel Overlay */}
      {showWalletPanel && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setShowWalletPanel(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[hsl(var(--background))] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="glass border-b border-border p-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Wallet Info</h2>
                <button
                  onClick={() => setShowWalletPanel(false)}
                  className="text-secondary-text hover:text-foreground transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <WalletInfoPanel />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-tw-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-secondary-text">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <WalletDashboardContent />
    </Suspense>
  );
}
