import { ethereum, base, polygon, arbitrum, optimism, sepolia } from "thirdweb/chains";

export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  chainName: string;
}

// Native token address (used for ETH, MATIC, etc.)
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Common token addresses across chains
export const TOKENS: Record<string, TokenInfo[]> = {
  // Native ETH across chains
  ETH: [
    {
      symbol: "ETH",
      name: "Ethereum",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      chainId: ethereum.id,
      chainName: "Ethereum",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      chainId: base.id,
      chainName: "Base",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      chainId: polygon.id,
      chainName: "Polygon",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      chainId: arbitrum.id,
      chainName: "Arbitrum",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      chainId: optimism.id,
      chainName: "Optimism",
    },
  ],
  USDC: [
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
      chainId: ethereum.id,
      chainName: "Ethereum",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      chainId: base.id,
      chainName: "Base",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      decimals: 6,
      chainId: polygon.id,
      chainName: "Polygon",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
      chainId: arbitrum.id,
      chainName: "Arbitrum",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      decimals: 6,
      chainId: optimism.id,
      chainName: "Optimism",
    },
  ],
  USDT: [
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
      chainId: ethereum.id,
      chainName: "Ethereum",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
      chainId: polygon.id,
      chainName: "Polygon",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
      chainId: arbitrum.id,
      chainName: "Arbitrum",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
      chainId: optimism.id,
      chainName: "Optimism",
    },
  ],
  WETH: [
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
      chainId: ethereum.id,
      chainName: "Ethereum",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      chainId: base.id,
      chainName: "Base",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
      chainId: polygon.id,
      chainName: "Polygon",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
      chainId: arbitrum.id,
      chainName: "Arbitrum",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      chainId: optimism.id,
      chainName: "Optimism",
    },
  ],
  DAI: [
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
      chainId: ethereum.id,
      chainName: "Ethereum",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      decimals: 18,
      chainId: polygon.id,
      chainName: "Polygon",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      chainId: arbitrum.id,
      chainName: "Arbitrum",
    },
    {
      symbol: "DAI",
      name: "Dai Stablecoin",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
      chainId: optimism.id,
      chainName: "Optimism",
    },
  ],
  MATIC: [
    {
      symbol: "MATIC",
      name: "Polygon",
      address: "0x0000000000000000000000000000000000001010",
      decimals: 18,
      chainId: polygon.id,
      chainName: "Polygon",
    },
  ],
};

// Helper function to find token by symbol and chain
export function findToken(symbol: string, chainId: number): TokenInfo | undefined {
  const upperSymbol = symbol.toUpperCase();
  const tokens = TOKENS[upperSymbol];
  if (!tokens) return undefined;
  return tokens.find((t) => t.chainId === chainId);
}

// Helper function to get all tokens for a chain
export function getTokensForChain(chainId: number): TokenInfo[] {
  const result: TokenInfo[] = [];
  Object.values(TOKENS).forEach((tokenList) => {
    const token = tokenList.find((t) => t.chainId === chainId);
    if (token) result.push(token);
  });
  return result;
}

// Helper function to parse token amount with decimals
export function parseTokenAmount(amount: string, decimals: number): bigint {
  try {
    // Remove any whitespace
    amount = amount.trim();
    
    // Validate input
    if (!amount || amount === "" || amount === ".") {
      throw new Error("Invalid amount: empty or invalid format");
    }
    
    // Check for valid number format
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      throw new Error("Invalid amount: must be a positive number");
    }
    
    const [whole = "0", fraction = ""] = amount.split(".");
    
    // Ensure we don't exceed decimals
    const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
    const result = whole + paddedFraction;
    
    // Validate the result
    if (result === "0".repeat(result.length)) {
      throw new Error("Invalid amount: cannot be zero");
    }
    
    return BigInt(result);
  } catch (error: any) {
    throw new Error(`Failed to parse token amount: ${error.message}`);
  }
}

// Helper function to format token amount from bigint
export function formatTokenAmount(amount: bigint, decimals: number): string {
  try {
    if (!amount && amount !== BigInt(0)) {
      return "0.0";
    }
    
    const amountStr = amount.toString().padStart(decimals + 1, "0");
    const whole = amountStr.slice(0, -decimals) || "0";
    const fraction = amountStr.slice(-decimals);
    
    // Trim trailing zeros from fraction for cleaner display
    const trimmedFraction = fraction.replace(/0+$/, "");
    
    if (trimmedFraction === "") {
      return whole;
    }
    
    return `${whole}.${trimmedFraction}`;
  } catch (error: any) {
    console.error("Error formatting token amount:", error);
    return "0.0";
  }
}
