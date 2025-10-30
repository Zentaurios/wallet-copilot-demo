"use server";

import { client } from "@/lib/thirdweb";
import { SwapManager, type SwapParams, type SwapQuote } from "@/lib/swap-manager";
import { findToken, parseTokenAmount, formatTokenAmount } from "@/lib/tokens";
import { getAuthenticatedUser } from "./auth";

const swapManager = new SwapManager(client);

export interface SwapRequest {
  fromToken: string; // Symbol like "ETH", "USDC"
  fromChain: number; // Chain ID
  toToken: string; // Symbol like "USDC", "DAI"
  toChain: number; // Chain ID
  amount: string; // Amount as string like "0.1"
}

export interface SwapQuoteResponse {
  success: boolean;
  quote?: {
    fromToken: string;
    fromChain: string;
    fromAmount: string;
    toToken: string;
    toChain: string;
    toAmount: string;
    estimatedTimeMs: number;
    priceImpact: number;
  };
  error?: string;
}

export async function prepareSwapQuote(
  request: SwapRequest
): Promise<SwapQuoteResponse> {
  try {
    // Validate input
    if (!request.fromToken || !request.toToken || !request.amount) {
      return {
        success: false,
        error: "Missing required swap parameters",
      };
    }

    // Validate amount is a valid number
    const amountNum = parseFloat(request.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        error: "Invalid swap amount",
      };
    }

    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Find token info
    const fromTokenInfo = findToken(request.fromToken, request.fromChain);
    const toTokenInfo = findToken(request.toToken, request.toChain);

    if (!fromTokenInfo) {
      return {
        success: false,
        error: `Token "${request.fromToken}" not found on the selected chain`,
      };
    }

    if (!toTokenInfo) {
      return {
        success: false,
        error: `Token "${request.toToken}" not found on the selected chain`,
      };
    }

    // Parse amount
    const amount = parseTokenAmount(request.amount, fromTokenInfo.decimals);

    // Prepare swap parameters
    const swapParams: SwapParams = {
      fromChainId: request.fromChain,
      fromTokenAddress: fromTokenInfo.address,
      toChainId: request.toChain,
      toTokenAddress: toTokenInfo.address,
      amount,
      userAddress: user.address,
      client,
    };

    // Get quote
    const quote = await swapManager.getQuote(swapParams);

    // Validate quote response
    if (!quote.originAmount || !quote.destinationAmount) {
      return {
        success: false,
        error: "Invalid quote response from bridge",
      };
    }

    // Calculate price impact (simplified)
    const fromAmountFloat = Number(formatTokenAmount(quote.originAmount, fromTokenInfo.decimals));
    const toAmountFloat = Number(formatTokenAmount(quote.destinationAmount, toTokenInfo.decimals));
    const priceImpact = Math.abs(1 - (toAmountFloat / fromAmountFloat)) * 100;

    return {
      success: true,
      quote: {
        fromToken: fromTokenInfo.symbol,
        fromChain: fromTokenInfo.chainName,
        fromAmount: formatTokenAmount(quote.originAmount, fromTokenInfo.decimals),
        toToken: toTokenInfo.symbol,
        toChain: toTokenInfo.chainName,
        toAmount: formatTokenAmount(quote.destinationAmount, toTokenInfo.decimals),
        estimatedTimeMs: quote.estimatedExecutionTimeMs || 180000, // Default 3 minutes
        priceImpact: isNaN(priceImpact) ? 0 : priceImpact,
      },
    };
  } catch (error: any) {
    console.error("Error preparing swap quote:", error);
    
    // Return more specific error messages
    let errorMessage = "Failed to prepare swap quote";
    
    if (error.message?.includes("insufficient")) {
      errorMessage = "Insufficient balance for this swap";
    } else if (error.message?.includes("not supported")) {
      errorMessage = "This token pair is not supported for swapping";
    } else if (error.message?.includes("network")) {
      errorMessage = "Network error - please try again";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface RouteInfo {
  fromToken: string;
  fromChain: string;
  toToken: string;
  toChain: string;
}

export async function getAvailableSwapRoutes(
  fromToken?: string,
  fromChain?: number
): Promise<{ success: boolean; routes?: RouteInfo[]; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    let params: any = { limit: 20 };

    if (fromToken && fromChain) {
      const tokenInfo = findToken(fromToken, fromChain);
      if (tokenInfo) {
        params.originChainId = tokenInfo.chainId;
        params.originTokenAddress = tokenInfo.address;
      }
    }

    const routes = await swapManager.getAvailableRoutes(params);

    const routeInfos: RouteInfo[] = routes.map((route: any) => ({
      fromToken: route.originToken.symbol,
      fromChain: route.originToken.chainName || `Chain ${route.originToken.chainId}`,
      toToken: route.destinationToken.symbol,
      toChain: route.destinationToken.chainName || `Chain ${route.destinationToken.chainId}`,
    }));

    return {
      success: true,
      routes: routeInfos,
    };
  } catch (error: any) {
    console.error("Error getting swap routes:", error);
    return {
      success: false,
      error: error.message || "Failed to get swap routes",
    };
  }
}
