"use client";

import { useActiveAccount, useWalletBalance, useSendTransaction, useSwitchActiveWalletChain, useActiveWalletChain } from "thirdweb/react";
import { useState, useEffect } from "react";
import { client } from "@/lib/thirdweb";
import { ethereum, base, polygon, arbitrum, optimism, sepolia } from "thirdweb/chains";
import { prepareTransaction, toWei } from "thirdweb";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { SwapWidget, BridgeWidget } from "thirdweb/react";

// Define available chains with metadata
const CHAINS = [
  { chain: ethereum, name: "Ethereum", icon: "🔷" },
  { chain: base, name: "Base", icon: "🔵" },
  { chain: polygon, name: "Polygon", icon: "🟣" },
  { chain: arbitrum, name: "Arbitrum", icon: "🔹" },
  { chain: optimism, name: "Optimism", icon: "🔴" },
  { chain: sepolia, name: "Sepolia", icon: "🧪" },
];

export function WalletInfoPanel() {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const [mounted, setMounted] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");

  // Get balance for the active chain
  const { data: balance, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain: activeChain || ethereum,
    address: account?.address,
  });

  const { mutate: sendTransaction, isPending: isSending } = useSendTransaction();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSend = async () => {
    if (!account || !sendTo || !sendAmount) return;

    try {
      const transaction = prepareTransaction({
        to: sendTo,
        value: toWei(sendAmount),
        chain: ethereum,
        client,
      });

      sendTransaction(transaction, {
        onSuccess: () => {
          toast.success("Transaction sent successfully!");
          setShowSendModal(false);
          setSendTo("");
          setSendAmount("");
        },
        onError: (error) => {
          toast.error(`Transaction failed: ${error.message}`);
        },
      });
    } catch (error) {
      console.error("Error preparing transaction:", error);
      toast.error("Failed to prepare transaction");
    }
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account.address);
      toast.success("Address copied to clipboard!");
    }
  };

  const handleSwapClick = () => {
    setShowSwapModal(true);
  };

  const handleBridgeClick = () => {
    setShowBridgeModal(true);
  };

  const handleSwitchChain = async (targetChain: typeof ethereum) => {
    try {
      await switchChain(targetChain);
      setShowChainSelector(false);
      toast.success(`Switched to ${CHAINS.find(c => c.chain.id === targetChain.id)?.name}!`);
    } catch (error: any) {
      toast.error(`Failed to switch chain: ${error.message}`);
    }
  };

  const getCurrentChainInfo = () => {
    return CHAINS.find(c => c.chain.id === activeChain?.id) || CHAINS[0];
  };

  if (!mounted || !account) {
    return (
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="h-6 bg-white/5 rounded animate-pulse" />
        <div className="h-20 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Wallet Address Card */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-secondary-text">Your Wallet</h3>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-secondary-text">Address</p>
            <p className="font-mono text-xs break-all">{account.address}</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-secondary-text">Balance</h3>
          <div className="space-y-4">
            {balanceLoading ? (
              <div className="h-12 bg-white/5 rounded animate-pulse" />
            ) : (
              <div>
                <p className="text-3xl font-bold">
                  {balance ? parseFloat(balance.displayValue).toFixed(4) : "0.0000"}
                </p>
                <p className="text-xs text-secondary-text mt-1">{balance?.symbol || "ETH"}</p>
              </div>
            )}
            <div className="pt-3 border-t border-border">
              <p className="text-sm text-secondary-text">Network</p>
              <button
                onClick={() => setShowChainSelector(!showChainSelector)}
                className="mt-1 w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{getCurrentChainInfo().icon}</span>
                  <span className="text-sm font-semibold">{getCurrentChainInfo().name}</span>
                </div>
                <span className="text-xs">↕️</span>
              </button>
              
              {/* Chain Selector Dropdown */}
              {showChainSelector && (
                <div className="mt-2 p-2 bg-white/5 rounded-lg border border-border space-y-1">
                  {CHAINS.map((chainInfo) => (
                    <button
                      key={chainInfo.chain.id}
                      onClick={() => handleSwitchChain(chainInfo.chain)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        activeChain?.id === chainInfo.chain.id
                          ? "bg-tw-primary/20 border border-tw-primary/30"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <span>{chainInfo.icon}</span>
                      <span className="text-sm">{chainInfo.name}</span>
                      {activeChain?.id === chainInfo.chain.id && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-secondary-text">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setShowSendModal(true)}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Send
            </button>
            <button 
              onClick={() => setShowReceiveModal(true)}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Receive
            </button>
            <button 
              onClick={handleSwapClick}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Swap
            </button>
            <button 
              onClick={handleBridgeClick}
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Bridge
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="glass rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-secondary-text">💡 Try asking the AI</h3>
          <div className="space-y-2 text-xs">
            <p className="text-secondary-text">"Swap 0.1 ETH to USDC" 🔄</p>
            <p className="text-secondary-text">"What's my ETH balance?"</p>
            <p className="text-secondary-text">"Send 0.01 ETH to vitalik.eth"</p>
            <p className="text-secondary-text">"What are gas prices right now?"</p>
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSendModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Send ETH</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-secondary-text">To Address</label>
                <input
                  type="text"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                  placeholder="0x... or ENS name"
                  className="w-full mt-1 px-4 py-2 bg-white/5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-tw-primary/50"
                />
              </div>

              <div>
                <label className="text-sm text-secondary-text">Amount (ETH)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  className="w-full mt-1 px-4 py-2 bg-white/5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-tw-primary/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!sendTo || !sendAmount || isSending}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-tw-primary to-tw-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold"
                >
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowReceiveModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Receive ETH</h2>
            
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center p-6 bg-white rounded-lg">
                <QRCodeSVG 
                  value={account.address}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Address Display */}
              <div className="space-y-2">
                <label className="text-sm text-secondary-text">Your Address</label>
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-border">
                  <p className="flex-1 font-mono text-xs break-all">{account.address}</p>
                  <button
                    onClick={handleCopyAddress}
                    className="shrink-0 px-3 py-1.5 rounded bg-gradient-to-r from-tw-primary to-tw-secondary hover:opacity-90 transition-opacity text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-200">
                  ⚠️ Only send ETH and ERC-20 tokens on Ethereum Mainnet to this address
                </p>
              </div>

              <button
                onClick={() => setShowReceiveModal(false)}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSwapModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Swap Tokens</h2>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-secondary-text hover:text-foreground transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <SwapWidget
              client={client}
              theme="dark"
              onSuccess={(quote) => {
                toast.success("Swap completed successfully!");
                setShowSwapModal(false);
              }}
              onError={(error) => {
                toast.error(`Swap failed: ${error.message}`);
              }}
            />
          </div>
        </div>
      )}

      {/* Bridge Modal */}
      {showBridgeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowBridgeModal(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Bridge Tokens</h2>
              <button
                onClick={() => setShowBridgeModal(false)}
                className="text-secondary-text hover:text-foreground transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <BridgeWidget
              client={client}
              theme="dark"
              swap={{
                onSuccess: (quote) => {
                  toast.success("Bridge completed successfully!");
                  setShowBridgeModal(false);
                },
                onError: (error) => {
                  toast.error(`Bridge failed: ${error.message}`);
                },
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
