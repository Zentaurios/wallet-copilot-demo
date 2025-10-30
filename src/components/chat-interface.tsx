"use client";

import { useState, useRef, useEffect } from "react";
import { useActiveAccount, useWalletBalance, useSendTransaction } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { ethereum, defineChain, base, polygon } from "thirdweb/chains";
import { prepareTransaction } from "thirdweb";
import { toast } from "sonner";
import { SwapWidget, BridgeWidget } from "thirdweb/react";
import { SwapQuoteCard } from "./swap-quote-card";
import { prepareSwapQuote, type SwapQuoteResponse } from "@/app/actions/swap";
import { findToken, NATIVE_TOKEN_ADDRESS } from "@/lib/tokens";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  transaction?: {
    chain_id: number;
    to: string;
    data: string;
    value: string;
  };
  swap?: {
    fromToken: {
      address: string;
      symbol: string;
      chainId: number;
    };
    toToken: {
      address: string;
      symbol: string;
      chainId: number;
    };
    amount: string;
  };
  swapQuote?: SwapQuoteResponse["quote"];
  bridgeRequest?: {
    fromChain: number;
    toChain: number;
    amount: string;
    token: string;
  };
  reasoning?: string;
}

interface ChatInterfaceProps {}

export function ChatInterface() {
  const account = useActiveAccount();
  const { data: balance, isLoading: balanceLoading } = useWalletBalance({
    client,
    chain: ethereum,
    address: account?.address,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [activeSwap, setActiveSwap] = useState<Message["swap"] | null>(null);
  const [activeBridge, setActiveBridge] = useState<Message["bridgeRequest"] | null>(null);
  const [preparingSwap, setPreparingSwap] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { mutate: sendTransaction, isPending: isSendingTx } = useSendTransaction();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll after initial load
    if (!isInitialLoad) {
      scrollToBottom();
    }
  }, [messages, currentResponse, isInitialLoad]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `👋 Hey! I'm your Wallet Copilot - powered by thirdweb AI with real blockchain data.

I can help you:
• 📊 Check balances and token holdings
• 💸 Prepare transactions for signing
• 🔄 Swap tokens across chains
• 🌉 Bridge assets between networks
• ⛽ Explain gas fees and costs
• 🔍 Look up addresses and transactions

What would you like to do?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Mark that we're past initial load
    setIsInitialLoad(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentResponse("");

    try {
      // Build conversation history for context
      const conversationMessages = [
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: input },
      ];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: conversationMessages,
          context: {
            chain_ids: [1], // Ethereum mainnet
            from: account?.address,
          },
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";
      let reasoning = "";
      let transaction: any = null;
      let swap: any = null;
      let currentEvent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            // Track event type
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            }
            // Parse data based on event type
            else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // Handle different event types
                if (currentEvent === "delta" && data.v) {
                  fullResponse += data.v;
                  setCurrentResponse(fullResponse);
                } else if (currentEvent === "presence" && data.data) {
                  reasoning = data.data;
                } else if (currentEvent === "action") {
                  if (data.type === "sign_transaction") {
                    transaction = data.data;
                  } else if (data.type === "sign_swap") {
                    swap = data.data;
                  }
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Try to detect and prepare swap quote
      const swapQuote = await detectAndPrepareSwap(input);
      
      // Try to detect bridge request
      const bridgeRequest = detectBridgeRequest(input);

      // Add the complete AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fullResponse || "I received your message but couldn't generate a response.",
        timestamp: new Date(),
        reasoning,
        transaction,
        swap,
        swapQuote: swapQuote ?? undefined,
        bridgeRequest: bridgeRequest ?? undefined,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCurrentResponse("");
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSignTransaction = async (transaction: any) => {
    try {
      const tx = prepareTransaction({
        client,
        chain: defineChain(transaction.chain_id),
        to: transaction.to,
        data: transaction.data,
        value: BigInt(transaction.value),
      });

      sendTransaction(tx, {
        onSuccess: (result) => {
          toast.success("Transaction sent successfully!");
          // Add a message confirming the transaction
          const confirmMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: `✅ Transaction sent! Hash: ${result.transactionHash}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, confirmMessage]);
        },
        onError: (error) => {
          toast.error(`Transaction failed: ${error.message}`);
        },
      });
    } catch (error: any) {
      toast.error("Failed to prepare transaction");
      console.error("Transaction prep error:", error);
    }
  };

  // Detect and prepare swap from message
  const detectAndPrepareSwap = async (message: string): Promise<SwapQuoteResponse["quote"] | null> => {
    // Simple regex patterns to detect swap intent
    const swapPatterns = [
      /swap\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(\w+)/i,
      /swap\s+(\d+\.?\d*)\s+(\w+)\s+for\s+(\w+)/i,
      /exchange\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(\w+)/i,
      /convert\s+(\d+\.?\d*)\s+(\w+)\s+to\s+(\w+)/i,
    ];

    for (const pattern of swapPatterns) {
      const match = message.match(pattern);
      if (match) {
        const [, amount, fromToken, toToken] = match;
        setPreparingSwap(true);
        
        try {
          // Default to ethereum for now, could be made smarter
          const result = await prepareSwapQuote({
            fromToken: fromToken.toUpperCase(),
            fromChain: ethereum.id,
            toToken: toToken.toUpperCase(),
            toChain: ethereum.id,
            amount,
          });
          
          if (result.success && result.quote) {
            toast.success("Swap quote prepared!");
            return result.quote;
          } else {
            // Only show error if it's something the user can fix
            if (result.error?.includes("not found") || result.error?.includes("not supported")) {
              toast.error(result.error);
            } else if (result.error) {
              console.error("Swap quote error:", result.error);
              toast.error("Unable to prepare swap quote");
            }
          }
        } catch (error: any) {
          console.error("Error preparing swap:", error);
          // Don't show toast for unexpected errors to avoid spamming user
          console.warn("Swap detection found pattern but failed to prepare quote");
        } finally {
          setPreparingSwap(false);
        }
        
        return null;
      }
    }
    
    return null;
  };

  // Detect bridge requests from message
  const detectBridgeRequest = (message: string): Message["bridgeRequest"] | null => {
    // Map chain names to IDs
    const chainMap: Record<string, number> = {
      ethereum: ethereum.id,
      eth: ethereum.id,
      mainnet: ethereum.id,
      base: base.id,
      polygon: polygon.id,
      matic: polygon.id,
    };

    // Bridge patterns: "bridge X ETH from Y to Z"
    const bridgePatterns = [
      /bridge\s+(\d+\.?\d*)\s*(\w+)?\s+from\s+(\w+)\s+to\s+(\w+)/i,
      /bridge\s+(?:my\s+)?(\w+)\s+from\s+(\w+)\s+to\s+(\w+)/i,
      /move\s+(\d+\.?\d*)\s*(\w+)?\s+from\s+(\w+)\s+to\s+(\w+)/i,
      /transfer\s+(\d+\.?\d*)\s*(\w+)?\s+from\s+(\w+)\s+to\s+(\w+)/i,
    ];

    for (const pattern of bridgePatterns) {
      const match = message.match(pattern);
      if (match) {
        const hasAmount = /^\d/.test(match[1]); // Check if first group is a number
        
        if (hasAmount) {
          // Pattern: "bridge 0.1 ETH from base to ethereum"
          const [, amount, token = "ETH", fromChainName, toChainName] = match;
          const fromChain = chainMap[fromChainName.toLowerCase()];
          const toChain = chainMap[toChainName.toLowerCase()];

          if (fromChain && toChain) {
            toast.info("Opening bridge widget...");
            return {
              fromChain,
              toChain,
              amount,
              token: token.toUpperCase(),
            };
          }
        } else {
          // Pattern: "bridge eth from base to ethereum" (no specific amount)
          const [, token, fromChainName, toChainName] = match;
          const fromChain = chainMap[fromChainName.toLowerCase()];
          const toChain = chainMap[toChainName.toLowerCase()];

          if (fromChain && toChain) {
            toast.info("Opening bridge widget...");
            return {
              fromChain,
              toChain,
              amount: "",
              token: token.toUpperCase(),
            };
          }
        }
      }
    }

    return null;
  };

  const quickPrompts = [
    "What's my balance?",
    "Swap 0.1 ETH to USDC",
    "Bridge ETH from Base to Ethereum",
    "Send 0.0001 ETH to vitalik.eth",
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Messages Area - no scroll here, parent handles it */}
      <div ref={messagesContainerRef} className="p-6 pb-32 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.role === "user"
                  ? "bg-gradient-to-br from-tw-primary to-tw-secondary text-white"
                  : "glass"
              }`}
            >
              {/* Reasoning (if present) */}
              {message.reasoning && (
                <div className="text-xs text-secondary-text mb-2 p-2 bg-white/5 rounded-lg border-l-2 border-tw-accent">
                  <span className="font-semibold">💭 Thinking: </span>
                  {message.reasoning}
                </div>
              )}

              {/* Main content */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Transaction UI */}
              {message.transaction && (
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-tw-primary/30">
                    <p className="text-xs text-secondary-text mb-2">
                      Transaction Details:
                    </p>
                    <div className="space-y-1 text-xs font-mono">
                      <p>To: {message.transaction.to}</p>
                      <p>Value: {BigInt(message.transaction.value).toString()} wei</p>
                      <p>Chain: {message.transaction.chain_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSignTransaction(message.transaction)}
                    disabled={isSendingTx}
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-tw-primary to-tw-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium text-sm"
                  >
                    {isSendingTx ? "Signing..." : "Sign & Send Transaction"}
                  </button>
                </div>
              )}

              {/* Swap Quote UI */}
              {message.swapQuote && (
                <SwapQuoteCard quote={message.swapQuote} />
              )}

              {/* Bridge Request UI */}
              {message.bridgeRequest && (
                <div className="mt-3 space-y-3">
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🌉</span>
                      <p className="text-sm font-semibold">Bridge Request Detected</p>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p>
                        <span className="text-secondary-text">Token:</span> {message.bridgeRequest.token}
                      </p>
                      {message.bridgeRequest.amount && (
                        <p>
                          <span className="text-secondary-text">Amount:</span> {message.bridgeRequest.amount}
                        </p>
                      )}
                      <p>
                        <span className="text-secondary-text">From:</span> Chain {message.bridgeRequest.fromChain}
                      </p>
                      <p>
                        <span className="text-secondary-text">To:</span> Chain {message.bridgeRequest.toChain}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveBridge(message.bridgeRequest!)}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 transition-opacity font-semibold text-sm shadow-lg shadow-blue-500/20"
                  >
                    Open Bridge Widget
                  </button>
                </div>
              )}

              {/* Legacy Swap UI (from thirdweb AI) */}
              {message.swap && !message.swapQuote && message.swap.fromToken && message.swap.toToken && (
                <div className="mt-3 space-y-3">
                  <div className="p-3 bg-white/5 rounded-lg border border-tw-accent/30">
                    <p className="text-xs text-secondary-text mb-2">
                      🔄 Swap Details:
                    </p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="text-secondary-text">From:</span> {message.swap.amount} {message.swap.fromToken.symbol}
                      </p>
                      <p>
                        <span className="text-secondary-text">To:</span> {message.swap.toToken.symbol}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSwap(message.swap!)}
                    className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-tw-accent to-tw-secondary hover:opacity-90 transition-opacity font-medium text-sm"
                  >
                    Open Swap Widget
                  </button>
                </div>
              )}

              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Streaming response */}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 max-w-[85%]">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {currentResponse}
              </div>
            </div>
          </div>
        )}

        {/* Preparing swap indicator */}
        {preparingSwap && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 max-w-[85%]">
              <div className="flex items-center gap-2">
                <div className="text-xl animate-spin">🔄</div>
                <span className="text-xs text-secondary-text">Preparing swap quote...</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && !currentResponse && !preparingSwap && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 max-w-[85%]">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full bg-tw-primary animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-tw-secondary animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 rounded-full bg-tw-accent animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <span className="text-xs text-secondary-text ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts - moved closer to messages */}
      {messages.length <= 1 && (
        <div className="px-6 pb-6 -mt-2">
          <p className="text-xs text-secondary-text mb-2">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-3 py-2 rounded-lg glass hover:bg-white/10 transition-colors text-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Sticky at bottom */}
      <div className="glass border-t border-border p-4 sticky bottom-0 bg-[hsl(var(--background))] z-10">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your wallet..."
            className="flex-1 bg-white/5 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-tw-primary/50 text-sm max-h-32 min-h-[80px] sm:min-h-[44px]"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-tw-primary to-tw-secondary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-medium text-sm flex items-center gap-2"
          >
            {isLoading ? (
              "..."
            ) : (
              <>
                Send <span className="text-lg">→</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-secondary-text mt-2">
          Ask about balances, prepare transactions, or get blockchain insights • Enter
          to send
        </p>
      </div>

      {/* Bridge Widget Modal */}
      {activeBridge && (() => {
        // Look up token addresses for the requested chains
        const fromToken = findToken(activeBridge.token, activeBridge.fromChain);
        const toToken = findToken(activeBridge.token, activeBridge.toChain);
        
        console.log('Bridge Request:', {
          fromChain: activeBridge.fromChain,
          toChain: activeBridge.toChain,
          token: activeBridge.token,
          amount: activeBridge.amount,
          fromToken,
          toToken
        });
        
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setActiveBridge(null)}>
            <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Bridge Tokens</h3>
                <button
                  onClick={() => setActiveBridge(null)}
                  className="text-secondary-text hover:text-foreground transition-colors text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Bridge Request Info */}
              <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-secondary-text">Token:</span>{" "}
                    <span className="font-semibold">{activeBridge.token}</span>
                  </p>
                  {activeBridge.amount && (
                    <p>
                      <span className="text-secondary-text">Amount:</span>{" "}
                      <span className="font-semibold">{activeBridge.amount}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-secondary-text">From Chain:</span>{" "}
                    <span className="font-semibold">
                      {activeBridge.fromChain === 1 ? "Ethereum" : 
                       activeBridge.fromChain === 8453 ? "Base" :
                       activeBridge.fromChain === 137 ? "Polygon" : 
                       `Chain ${activeBridge.fromChain}`}
                    </span>
                  </p>
                  <p>
                    <span className="text-secondary-text">To Chain:</span>{" "}
                    <span className="font-semibold">
                      {activeBridge.toChain === 1 ? "Ethereum" : 
                       activeBridge.toChain === 8453 ? "Base" :
                       activeBridge.toChain === 137 ? "Polygon" : 
                       `Chain ${activeBridge.toChain}`}
                    </span>
                  </p>
                </div>
              </div>
              
              <BridgeWidget
                client={client}
                theme="dark"
                swap={{
                  prefill: fromToken && toToken ? {
                    // Source chain (where tokens are coming from)
                    sellToken: {
                      chainId: activeBridge.fromChain,
                      tokenAddress: fromToken.address,
                      amount: activeBridge.amount || undefined,
                    },
                    // Destination chain (where tokens are going)
                    buyToken: {
                      chainId: activeBridge.toChain,
                      tokenAddress: toToken.address,
                    },
                  } : undefined,
                  onSuccess: (result) => {
                    toast.success("Bridge completed successfully!");
                    setActiveBridge(null);
                  },
                  onError: (error) => {
                    toast.error(`Bridge failed: ${error.message}`);
                  },
                }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
