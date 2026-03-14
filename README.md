# 🔄 Agent Commerce Loop

**An autonomous AI agent commerce pipeline using three MCP servers — WebMCP, AgentPay, and Notion MCP — orchestrated into a single workflow.**

> Built for the [DEV Notion MCP Challenge](https://dev.to/challenges/notion-2026-03-04)

## What It Does

An AI agent autonomously:

1. **🔍 Discovers** services on the web using [WebMCP](https://github.com/nicholasgriffintn/webmcp-sdk) (`navigator.modelContext`)
2. **💳 Pays** for services using [AgentPay](https://github.com/nicholasgriffintn/agentpay-mcp) x402 protocol (USDC on Base)
3. **📋 Logs** every transaction to [Notion](https://developers.notion.com/docs/mcp) for human oversight

The human stays in the loop through Notion — they see every transaction, set budgets, and review automated spend reports.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   WebMCP    │     │  AgentPay   │     │ Notion MCP  │
│  (Discover) │ ──→ │   (Pay)     │ ──→ │   (Log)     │
│             │     │  x402/USDC  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       ↑                                       │
       └──── Agent Commerce Loop ◄─────────────┘
```

## Why This Matters

AI agents are becoming autonomous economic actors. They need to:
- **Find** services (WebMCP provides the discovery layer)
- **Pay** for services (x402 provides the payment protocol)
- **Account** for spending (Notion provides the human-readable audit trail)

This project demonstrates all three working together — the beginning of an autonomous agent economy.

## Quick Start

```bash
# Clone
git clone https://github.com/up2itnow0822/notion-agent-commerce-loop
cd notion-agent-commerce-loop

# Install
npm install

# Configure (see .env.example)
cp .env.example .env
# Add your Notion API key and parent page ID

# Run the demo
npm run demo
```

## Setup

### 1. Create a Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new internal integration
3. Copy the API key to your `.env` file

### 2. Share a Notion Page

1. Create a new page in Notion (this will be the parent for the commerce database)
2. Click "Share" → Invite your integration
3. Copy the page ID from the URL to your `.env` file

### 3. Run

```bash
npm run demo
```

The agent will:
- Scan for WebMCP-enabled services matching its capabilities
- Evaluate each against its $5 USDC budget
- Pay for qualifying services via x402
- Log every transaction to a new "Agent Commerce Ledger" database in Notion
- Generate a spend summary report page

## Architecture

### Three MCP Servers

| Server | Role | Protocol |
|--------|------|----------|
| **WebMCP** | Service discovery | `navigator.modelContext` |
| **AgentPay** | Autonomous payments | x402 / USDC on Base |
| **Notion MCP** | Transaction ledger | Notion API |

### The Commerce Loop

```typescript
// 1. DISCOVER — Find services via WebMCP
const services = await discovery.discoverServices(["security-scan", "sentiment"]);

// 2. EVALUATE — Check against budget
const decision = await discovery.evaluateService(service, budget);

// 3. PAY — Execute x402 payment
const payment = await agentpay.payForService(service);

// 4. LOG — Record in Notion
await notion.logTransaction({
  service: service.name,
  amount: payment.amount,
  txHash: payment.txHash,
  // ... full audit trail
});
```

### Notion Database Schema

The agent creates an "Agent Commerce Ledger" database with:

| Column | Type | Description |
|--------|------|-------------|
| Service | Title | What was purchased |
| Provider | Text | Who provided it |
| Amount | Number | Cost in USD |
| Currency | Select | USDC / ETH |
| Tx Hash | URL | Link to Basescan |
| Chain | Select | Base / Ethereum / Polygon |
| Status | Select | Pending / Confirmed / Failed |
| Discovery Method | Select | WebMCP / Direct / Referral |
| Agent ID | Text | Which agent made the purchase |
| Timestamp | Date | When the transaction occurred |

## The Stack

- **[WebMCP SDK](https://www.npmjs.com/package/webmcp-sdk)** — Browser-native agent commerce protocol
- **[AgentPay MCP](https://www.npmjs.com/package/agentpay-mcp)** — x402 payment layer for AI agents
- **[Notion API](https://developers.notion.com)** — Workspace API for the transaction ledger
- **TypeScript** — Type-safe agent logic
- **Base (L2)** — Low-cost USDC transactions

## License

MIT — Built by [AI Agent Economy](https://ai-agent-economy.com)
