"use client";

import { useState } from "react";
import { SwapWidget } from "thirdweb/react";
import { client } from "@/lib/thirdweb";
import { toast } from "sonner";

interface SwapQuote {
  fromToken: string;
  fromChain: string;
  fromAmount: string;
  toToken: string;
  toChain: string;
  toAmount: string;
  estimatedTimeMs: number;
  priceImpact: number;
}

interface SwapQuoteCardProps {
  quote: SwapQuote;
}

export function SwapQuoteCard({ quote }: SwapQuoteCardProps) {
  const [showWidget, setShowWidget] = useState(false);

  // Safety checks
  if (!quote || !quote.fromToken || !quote.toToken) {
    return (
      <div className="mt-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
        <p className="text-sm text-red-400">Unable to display swap quote - missing data</p>
      </div>
    );
  }

  const estimatedMinutes = Math.ceil((quote.estimatedTimeMs || 0) / 60000);

  return (
    <>
      <div className="mt-3 space-y-3">
        {/* Quote Display */}
        <div className="p-4 bg-gradient-to-br from-tw-accent/10 to-tw-primary/10 rounded-lg border border-tw-accent/30">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔄</span>
            <p className="text-sm font-semibold">Swap Quote Ready</p>
          </div>
          
          <div className="space-y-2">
            {/* From/To Display */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary-text">You Send</p>
                <p className="text-lg font-bold">
                  {parseFloat(quote.fromAmount).toFixed(4)} {quote.fromToken}
                </p>
                <p className="text-xs text-secondary-text">{quote.fromChain}</p>
              </div>
              <div className="text-2xl">→</div>
              <div className="text-right">
                <p className="text-xs text-secondary-text">You Receive</p>
                <p className="text-lg font-bold text-tw-accent">
                  {parseFloat(quote.toAmount).toFixed(4)} {quote.toToken}
                </p>
                <p className="text-xs text-secondary-text">{quote.toChain}</p>
              </div>
            </div>

            {/* Details */}
            <div className="pt-3 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-secondary-text">Estimated Time:</span>
                <span className="font-medium">~{estimatedMinutes} min</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary-text">Price Impact:</span>
                <span className={`font-medium ${quote.priceImpact > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowWidget(true)}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-tw-accent to-tw-secondary hover:opacity-90 transition-opacity font-semibold text-sm shadow-lg shadow-tw-accent/20"
        >
          Execute Swap
        </button>
      </div>

      {/* Swap Widget Modal */}
      {showWidget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowWidget(false)}>
          <div className="glass rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Complete Your Swap</h3>
              <button
                onClick={() => setShowWidget(false)}
                className="text-secondary-text hover:text-foreground transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <SwapWidget
              client={client}
              theme="dark"
              onSuccess={(result) => {
                toast.success("Swap completed successfully!");
                setShowWidget(false);
              }}
              onError={(error) => {
                toast.error(`Swap failed: ${error.message}`);
              }}
              onCancel={() => {
                setShowWidget(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
