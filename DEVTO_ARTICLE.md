---
title: I Built an Autonomous Agent Commerce Pipeline with Notion MCP
published: false
tags: devchallenge, notionchallenge, mcp, ai
---

*This is a submission for the [Notion MCP Challenge](https://dev.to/challenges/notion-2026-03-04)*

## What I Built

An **Agent Commerce Loop** — an autonomous AI agent that discovers services on the web, pays for them with cryptocurrency, and logs every transaction to Notion for human oversight.

Three MCP servers working together in one pipeline:

```
WebMCP (Discover) → AgentPay x402 (Pay) → Notion MCP (Log)
```

The idea is simple but powerful: AI agents are becoming economic actors. They need to **find** services, **pay** for services, and **account** for their spending. Notion becomes the human-in-the-loop layer — where you see what your agents are buying and how much they're spending.

### The Problem

Right now, AI agents can do tasks but can't transact autonomously. If an agent needs a code review, market data, or content generation, it has to ask a human to pay. That's a bottleneck.

The x402 protocol (an HTTP extension for micropayments) changes this. An agent gets a `402 Payment Required` response, constructs a USDC payment on Base, sends the payment proof in the `X-PAYMENT` header, and gets access. No human needed for the transaction — but the human sees everything in Notion.

### How It Works

**Step 1: DISCOVER** — The agent scans WebMCP-enabled websites for services matching its needs. WebMCP (`navigator.modelContext`) lets websites expose structured service metadata to AI agents — pricing, capabilities, payment addresses.

**Step 2: EVALUATE** — The agent checks each service against its budget (set by the human in Notion). If a code review costs $0.50 and the budget is $5, it's approved. If it's over budget, the agent skips it and logs why.

**Step 3: PAY** — Using AgentPay's x402 implementation, the agent sends USDC on Base to the service provider's wallet. Sub-second, sub-cent transaction fees.

**Step 4: LOG** — Every transaction hits Notion. The agent creates a database entry with service name, provider, amount, transaction hash (linked to Basescan), chain, status, and which agent made the purchase.

**Step 5: REPORT** — The agent generates a spend summary page in Notion so the human operator can review spending patterns at a glance.

## Video Demo

<!-- Video demo link will be added before submission -->
<!-- TODO: Record terminal demo + Notion walkthrough -->

## Show us the code

{% github up2itnow0822/notion-agent-commerce-loop %}

### Key Files

- **`src/agent.ts`** — The orchestrator that runs the full DISCOVER → EVALUATE → PAY → LOG loop
- **`src/discovery.ts`** — WebMCP service discovery (scans for purchasable services)
- **`src/payment.ts`** — AgentPay x402 payment execution (USDC on Base)
- **`src/notion-client.ts`** — Notion MCP integration (creates database, logs transactions, generates reports)
- **`src/demo.ts`** — Run the full loop end-to-end

### Quick Start

```bash
git clone https://github.com/up2itnow0822/notion-agent-commerce-loop
cd notion-agent-commerce-loop
npm install
cp .env.example .env
# Add your Notion API key + parent page ID
npm run demo
```

## How I Used Notion MCP

Notion is the **human-in-the-loop layer** for autonomous agent commerce. Here's exactly what the agent does with Notion:

### 1. Creates a Transaction Database

On first run, the agent creates an "Agent Commerce Ledger" database in Notion with a full schema:

| Column | Type | Purpose |
|--------|------|---------|
| Service | Title | What was purchased |
| Provider | Text | Who provided it |
| Amount | Number ($) | Cost in USD |
| Currency | Select | USDC / ETH |
| Tx Hash | URL | Link to block explorer |
| Chain | Select | Base / Ethereum / Polygon |
| Status | Select | Pending / Confirmed / Failed |
| Discovery Method | Select | WebMCP / Direct / Referral |
| Agent ID | Text | Which agent bought it |
| Timestamp | Date | When |

### 2. Logs Every Transaction

After each x402 payment confirms, the agent immediately writes a row to the Notion database. The human operator can:
- See transactions in real-time
- Filter by agent, provider, or status
- Click the Tx Hash to verify on-chain
- Sort by amount to spot unusual spending

### 3. Generates Spend Reports

The agent queries its own transaction history in Notion and creates a summary page with:
- Total spend for the period
- Breakdown by provider
- Breakdown by service type
- Transaction count

This is the agent equivalent of an expense report — automatically generated, instantly available.

### Why Notion?

Notion is the perfect "control plane" for autonomous agents because:
- **Humans already use it** — No new tool to learn
- **Structured + flexible** — Databases for transactions, pages for reports
- **Real-time** — Changes appear instantly
- **Queryable** — Agents can read their own history to make better decisions
- **Collaborative** — Multiple humans can review agent spending

The key insight: **agents should earn trust incrementally**. Start with small budgets, log everything, let humans review. Notion makes this natural.

---

### The Stack

| Component | Role | Open Source |
|-----------|------|-------------|
| [WebMCP SDK](https://npmjs.com/package/webmcp-sdk) | Service discovery | ✅ MIT |
| [AgentPay MCP](https://npmjs.com/package/agentpay-mcp) | x402 payments | ✅ MIT |
| [Notion API](https://developers.notion.com) | Transaction ledger | N/A |
| TypeScript | Agent logic | — |
| Base (L2) | USDC settlement | — |

Built by [AI Agent Economy](https://ai-agent-economy.com) — building infrastructure for autonomous agent commerce.
