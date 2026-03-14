/**
 * Commerce Agent — The autonomous orchestrator
 *
 * This is the brain of the Agent Commerce Loop. It:
 * 1. Uses WebMCP to discover services matching its needs
 * 2. Evaluates services against its budget and requirements
 * 3. Pays for selected services via AgentPay x402
 * 4. Logs every transaction to Notion for human oversight
 * 5. Generates spend reports for the human operator
 *
 * The human stays in the loop through Notion — they see every transaction,
 * can set budgets, approve/reject services, and review spend reports.
 */

import { ServiceDiscovery, DiscoverableService } from "./discovery.js";
import { AgentPayClient, PaymentResult } from "./payment.js";
import { NotionCommerceClient, TransactionRecord } from "./notion-client.js";

export interface AgentConfig {
  agentId: string;
  walletAddress: string;
  budget: number;
  notionApiKey: string;
  notionParentPageId: string;
  capabilities: string[];
}

export interface CommerceLoopResult {
  discovered: DiscoverableService[];
  evaluated: Array<{
    service: DiscoverableService;
    decision: { shouldPurchase: boolean; reason: string };
  }>;
  purchased: Array<{
    service: DiscoverableService;
    payment: PaymentResult;
    notionPageId: string;
  }>;
  report: {
    totalSpent: number;
    servicesDiscovered: number;
    servicesPurchased: number;
    budgetRemaining: number;
  };
}

export class CommerceAgent {
  private discovery: ServiceDiscovery;
  private payments: AgentPayClient;
  private notion: NotionCommerceClient;
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.discovery = new ServiceDiscovery();
    this.payments = new AgentPayClient(config.walletAddress, config.budget);
    this.notion = new NotionCommerceClient(
      config.notionApiKey,
      config.notionParentPageId
    );
  }

  /**
   * Execute the full commerce loop
   *
   * DISCOVER → EVALUATE → PAY → LOG
   */
  async executeCommerceLoop(): Promise<CommerceLoopResult> {
    console.log("\n═══════════════════════════════════════════");
    console.log("  🔄 AGENT COMMERCE LOOP — Starting");
    console.log(`  Agent: ${this.config.agentId}`);
    console.log(`  Budget: $${this.config.budget.toFixed(2)} USDC`);
    console.log(
      `  Looking for: ${this.config.capabilities.join(", ")}`
    );
    console.log("═══════════════════════════════════════════\n");

    // Step 0: Initialize Notion ledger
    console.log("📋 Step 0: Initializing Notion commerce ledger...");
    await this.notion.initLedger();

    // Step 1: DISCOVER — Scan for services via WebMCP
    console.log("\n🔍 Step 1: DISCOVER — Scanning WebMCP services...");
    const discovered = await this.discovery.discoverServices(
      this.config.capabilities
    );
    console.log(`   Found ${discovered.length} matching services\n`);

    // Step 2: EVALUATE — Check each service against budget
    console.log("🤔 Step 2: EVALUATE — Analyzing services...");
    const evaluated = [];
    for (const service of discovered) {
      const decision = await this.discovery.evaluateService(
        service,
        this.config.budget
      );
      evaluated.push({ service, decision });
      console.log(
        `   ${decision.shouldPurchase ? "✓" : "✗"} ${service.name} ($${service.price}) — ${decision.reason}`
      );
    }
    console.log();

    // Step 3: PAY — Purchase approved services via x402
    console.log("💳 Step 3: PAY — Executing x402 payments...");
    const purchased = [];
    let totalSpent = 0;

    for (const { service, decision } of evaluated) {
      if (!decision.shouldPurchase) continue;

      const payment = await this.payments.payForService(service);

      if (payment.success) {
        // Step 4: LOG — Record transaction in Notion
        console.log("📝 Step 4: LOG — Recording in Notion...");
        const txRecord: TransactionRecord = {
          service: service.name,
          provider: service.provider,
          amount: payment.amount,
          currency: payment.currency,
          txHash: payment.txHash,
          chain: payment.chain,
          status: "confirmed",
          discoveryMethod: service.discoveredVia,
          agentId: this.config.agentId,
          timestamp: payment.timestamp,
        };

        const notionPageId = await this.notion.logTransaction(txRecord);
        purchased.push({ service, payment, notionPageId });
        totalSpent += parseFloat(payment.amount);
      } else {
        console.log(`   ✗ Payment failed: ${payment.error}`);
      }
    }

    // Generate spend report
    const balance = await this.payments.getBalance();
    const result: CommerceLoopResult = {
      discovered,
      evaluated,
      purchased,
      report: {
        totalSpent,
        servicesDiscovered: discovered.length,
        servicesPurchased: purchased.length,
        budgetRemaining: parseFloat(balance.balanceUSDC),
      },
    };

    // Create Notion spend report page
    if (purchased.length > 0) {
      console.log("\n📊 Generating Notion spend report...");
      const report = await this.notion.generateSpendReport(1);
      await this.notion.createSpendSummaryPage(report);
    }

    // Print summary
    console.log("\n═══════════════════════════════════════════");
    console.log("  ✅ COMMERCE LOOP COMPLETE");
    console.log(`  Services discovered: ${result.report.servicesDiscovered}`);
    console.log(`  Services purchased:  ${result.report.servicesPurchased}`);
    console.log(`  Total spent:         $${result.report.totalSpent.toFixed(2)}`);
    console.log(
      `  Budget remaining:    $${result.report.budgetRemaining.toFixed(2)}`
    );
    console.log("  Notion ledger:       ✓ Updated");
    console.log("═══════════════════════════════════════════\n");

    return result;
  }
}
