import {
  Bridge,
  sendAndConfirmTransaction,
  type ThirdwebClient,
} from "thirdweb";
import type { Account } from "thirdweb/wallets";

export interface SwapParams {
  fromChainId: number;
  fromTokenAddress: string;
  toChainId: number;
  toTokenAddress: string;
  amount: bigint;
  userAddress: string;
  client: ThirdwebClient;
}

export interface SwapQuote {
  originAmount: bigint;
  destinationAmount: bigint;
  estimatedExecutionTimeMs: number;
  steps: any[];
}

export class SwapManager {
  private client: ThirdwebClient;

  constructor(client: ThirdwebClient) {
    this.client = client;
  }

  async getQuote(params: SwapParams): Promise<SwapQuote> {
    try {
      const quote = await Bridge.Buy.prepare({
        originChainId: params.fromChainId,
        originTokenAddress: params.fromTokenAddress,
        destinationChainId: params.toChainId,
        destinationTokenAddress: params.toTokenAddress,
        amount: params.amount,
        sender: params.userAddress,
        receiver: params.userAddress,
        client: this.client,
      });

      return {
        originAmount: quote.originAmount,
        destinationAmount: quote.destinationAmount,
        estimatedExecutionTimeMs: quote.estimatedExecutionTimeMs ?? 0,
        steps: quote.steps,
      };
    } catch (error: any) {
      throw new Error(`Failed to get swap quote: ${error.message}`);
    }
  }

  async executeSwap(quote: SwapQuote, account: Account): Promise<string[]> {
    const transactionHashes: string[] = [];

    try {
      for (const step of quote.steps) {
        for (const transaction of step.transactions) {
          const result = await sendAndConfirmTransaction({
            transaction,
            account,
          });

          transactionHashes.push(result.transactionHash);
    
          // Wait for cross-chain completion if needed
          if (["buy", "sell", "transfer"].includes(transaction.action)) {
            await this.waitForCompletion(
              result.transactionHash as `0x${string}`,
              transaction.chainId
            );
          }
        }
      }

      return transactionHashes;
    } catch (error: any) {
      throw new Error(`Swap execution failed: ${error.message}`);
    }
  }

  private async waitForCompletion(
    transactionHash: `0x${string}`,
    chainId: number
  ): Promise<void> {
    let attempts = 0;
    const maxAttempts = 200; // 10 minutes max wait

    while (attempts < maxAttempts) {
      try {
        const status = await Bridge.status({
          transactionHash,
          chainId,
          client: this.client,
        });

        if (status.status === "COMPLETED") {
          return;
        }

        if (status.status === "FAILED") {
          throw new Error("Cross-chain transaction failed");
        }

        // Wait 3 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    throw new Error("Transaction timeout - please check status manually");
  }

  async getAvailableRoutes(params: {
    originChainId?: number;
    originTokenAddress?: string;
    destinationChainId?: number;
    destinationTokenAddress?: string;
    limit?: number;
  }) {
    try {
      return await Bridge.routes({
        ...params,
        client: this.client,
      });
    } catch (error: any) {
      throw new Error(`Failed to get routes: ${error.message}`);
    }
  }
}
