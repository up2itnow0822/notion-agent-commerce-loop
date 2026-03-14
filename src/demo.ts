/**
 * Agent Commerce Loop — Demo Runner
 *
 * This demo shows an AI agent autonomously:
 * 1. Discovering services via WebMCP
 * 2. Paying for them via x402 (AgentPay)
 * 3. Logging everything to Notion for human oversight
 *
 * Run: npx tsx src/demo.ts
 *
 * Prerequisites:
 * - NOTION_API_KEY in .env (get from https://www.notion.so/my-integrations)
 * - NOTION_PARENT_PAGE_ID in .env (page where the database will be created)
 */

import "dotenv/config";
import { CommerceAgent } from "./agent.js";

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  🔄 Agent Commerce Loop — Demo              ║");
  console.log("║  WebMCP → AgentPay x402 → Notion MCP        ║");
  console.log("║  Three MCP servers, one autonomous workflow  ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const notionApiKey = process.env.NOTION_API_KEY;
  const notionParentPageId = process.env.NOTION_PARENT_PAGE_ID;

  if (!notionApiKey || !notionParentPageId) {
    console.error("❌ Missing environment variables:");
    console.error("   NOTION_API_KEY — Get from https://www.notion.so/my-integrations");
    console.error("   NOTION_PARENT_PAGE_ID — ID of the Notion page where the database will be created");
    console.error("\nCreate a .env file with these values, then run again.");
    process.exit(1);
  }

  // Configure the autonomous commerce agent
  const agent = new CommerceAgent({
    agentId: "commerce-agent-001",
    walletAddress: "0xAgentWallet...abc123",
    budget: 5.0, // $5 USDC spending limit
    notionApiKey,
    notionParentPageId,
    capabilities: [
      "security-scan",
      "sentiment",
      "blog-posts",
      "docs-translation",
    ],
  });

  try {
    // Execute the full commerce loop
    const result = await agent.executeCommerceLoop();

    // Output for the DEV.to article
    console.log("📋 Transaction Details:");
    console.log("─".repeat(60));
    for (const { service, payment } of result.purchased) {
      console.log(`  Service:  ${service.name}`);
      console.log(`  Provider: ${service.provider}`);
      console.log(`  Amount:   $${payment.amount} ${payment.currency}`);
      console.log(`  Tx Hash:  ${payment.txHash}`);
      console.log(`  Chain:    ${payment.chain}`);
      console.log(`  Status:   ✅ Confirmed`);
      console.log("─".repeat(60));
    }

    console.log("\n🎯 What just happened:");
    console.log("1. Agent scanned WebMCP-enabled services for matching capabilities");
    console.log("2. Agent evaluated each service against its $5 budget");
    console.log("3. Agent paid for qualifying services using x402 protocol (USDC on Base)");
    console.log("4. Every transaction was logged to Notion with full audit trail");
    console.log("5. A spend report was generated in Notion for human review");
    console.log("\n→ Open Notion to see the Agent Commerce Ledger database! 📊");

  } catch (error) {
    console.error("❌ Commerce loop failed:", error);
    process.exit(1);
  }
}

main();
