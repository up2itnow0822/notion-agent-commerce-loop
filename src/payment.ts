/**
 * AgentPay x402 Payment Client — Handles autonomous agent-to-agent payments
 *
 * Uses the x402 HTTP payment protocol to execute USDC payments on Base.
 * In production, this connects to real wallets via agentwallet-sdk.
 * For the demo, we simulate the payment flow with realistic transaction hashes.
 *
 * The x402 flow:
 * 1. Agent requests a paid resource → gets HTTP 402 + payment requirements
 * 2. Agent constructs payment using agentwallet-sdk
 * 3. Agent sends payment proof in the `X-PAYMENT` header
 * 4. Server verifies payment on-chain and grants access
 */

import { DiscoverableService } from "./discovery.js";

export interface PaymentResult {
  success: boolean;
  txHash: string;
  amount: string;
  currency: string;
  chain: string;
  fromAddress: string;
  toAddress: string;
  blockNumber: number;
  gasUsed: string;
  timestamp: string;
  error?: string;
}

export interface WalletBalance {
  address: string;
  balanceUSDC: string;
  balanceETH: string;
  chain: string;
}

export class AgentPayClient {
  private walletAddress: string;
  private balance: number;
  private transactionLog: PaymentResult[] = [];

  constructor(walletAddress: string, initialBalance: number = 10.0) {
    this.walletAddress = walletAddress;
    this.balance = initialBalance;
  }

  /**
   * Check wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    return {
      address: this.walletAddress,
      balanceUSDC: this.balance.toFixed(2),
      balanceETH: "0.005",
      chain: "Base",
    };
  }

  /**
   * Execute x402 payment for a discovered service
   *
   * Flow:
   * 1. Verify sufficient balance
   * 2. Construct x402 payment header
   * 3. Submit transaction to Base
   * 4. Return payment proof
   */
  async payForService(service: DiscoverableService): Promise<PaymentResult> {
    const amount = parseFloat(service.price);
    const timestamp = new Date().toISOString();

    console.log(
      `💳 Initiating x402 payment: $${service.price} USDC → ${service.provider}`
    );

    // Step 1: Balance check
    if (amount > this.balance) {
      return {
        success: false,
        txHash: "",
        amount: service.price,
        currency: service.currency,
        chain: service.chain,
        fromAddress: this.walletAddress,
        toAddress: service.paymentAddress,
        blockNumber: 0,
        gasUsed: "0",
        timestamp,
        error: `Insufficient balance: $${this.balance.toFixed(2)} < $${service.price}`,
      };
    }

    // Step 2: Simulate x402 payment execution
    // In production: agentwallet-sdk creates the payment header and signs on-chain
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate realistic transaction hash
    const txHash = `0x${this.generateTxHash()}`;
    const blockNumber = 28000000 + Math.floor(Math.random() * 100000);
    const gasUsed = (21000 + Math.floor(Math.random() * 5000)).toString();

    // Step 3: Deduct balance
    this.balance -= amount;

    const result: PaymentResult = {
      success: true,
      txHash,
      amount: service.price,
      currency: service.currency,
      chain: service.chain,
      fromAddress: this.walletAddress,
      toAddress: service.paymentAddress,
      blockNumber,
      gasUsed,
      timestamp,
    };

    this.transactionLog.push(result);
    console.log(`✓ Payment confirmed: ${txHash}`);
    console.log(`  Balance remaining: $${this.balance.toFixed(2)} USDC`);

    return result;
  }

  /**
   * Get all transactions executed by this agent
   */
  getTransactionHistory(): PaymentResult[] {
    return this.transactionLog;
  }

  /**
   * Generate a realistic-looking transaction hash
   */
  private generateTxHash(): string {
    const chars = "0123456789abcdef";
    let hash = "";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }
}
