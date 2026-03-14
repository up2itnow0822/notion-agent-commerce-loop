/**
 * Notion MCP Client — Creates and manages the agent commerce ledger in Notion
 *
 * This module handles all Notion operations:
 * - Creating the commerce database (if it doesn't exist)
 * - Logging transactions as database entries
 * - Querying transaction history
 * - Generating spend reports
 */

import { Client } from "@notionhq/client";

export interface TransactionRecord {
  service: string;
  provider: string;
  amount: string;
  currency: string;
  txHash: string;
  chain: string;
  status: "pending" | "confirmed" | "failed";
  discoveryMethod: string;
  agentId: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface SpendReport {
  totalSpent: number;
  transactionCount: number;
  byProvider: Record<string, number>;
  byService: Record<string, number>;
  period: string;
}

export class NotionCommerceClient {
  private client: Client;
  private databaseId: string | null = null;
  private parentPageId: string;

  constructor(apiKey: string, parentPageId: string) {
    this.client = new Client({ auth: apiKey });
    this.parentPageId = parentPageId;
  }

  /**
   * Initialize the commerce ledger database in Notion
   * Creates a new database if one doesn't exist, or connects to an existing one
   */
  async initLedger(): Promise<string> {
    // Search for existing commerce ledger database
    const search = await this.client.search({
      query: "Agent Commerce Ledger",
      filter: { property: "object", value: "database" },
    });

    if (search.results.length > 0) {
      const db = search.results[0];
      this.databaseId = db.id;
      console.log(`✓ Connected to existing ledger: ${db.id}`);
      return db.id;
    }

    // Create new database under the parent page
    const db = await this.client.databases.create({
      parent: { type: "page_id", page_id: this.parentPageId },
      title: [{ type: "text", text: { content: "Agent Commerce Ledger" } }],
      description: [
        {
          type: "text",
          text: {
            content:
              "Autonomous agent transaction log — powered by AgentPay x402",
          },
        },
      ],
      properties: {
        Service: { title: {} },
        Provider: { rich_text: {} },
        Amount: { number: { format: "dollar" } },
        Currency: { select: { options: [{ name: "USDC" }, { name: "ETH" }] } },
        "Tx Hash": { url: {} },
        Chain: {
          select: {
            options: [
              { name: "Base" },
              { name: "Ethereum" },
              { name: "Polygon" },
            ],
          },
        },
        Status: {
          select: {
            options: [
              { name: "Pending", color: "yellow" },
              { name: "Confirmed", color: "green" },
              { name: "Failed", color: "red" },
            ],
          },
        },
        "Discovery Method": {
          select: {
            options: [
              { name: "WebMCP", color: "blue" },
              { name: "Direct", color: "gray" },
              { name: "Referral", color: "purple" },
            ],
          },
        },
        "Agent ID": { rich_text: {} },
        Timestamp: { date: {} },
      },
    });

    this.databaseId = db.id;
    console.log(`✓ Created new commerce ledger: ${db.id}`);
    return db.id;
  }

  /**
   * Log a transaction to the Notion commerce ledger
   */
  async logTransaction(tx: TransactionRecord): Promise<string> {
    if (!this.databaseId) {
      throw new Error("Ledger not initialized — call initLedger() first");
    }

    const basescanUrl = tx.txHash
      ? `https://basescan.org/tx/${tx.txHash}`
      : undefined;

    const page = await this.client.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        Service: { title: [{ text: { content: tx.service } }] },
        Provider: { rich_text: [{ text: { content: tx.provider } }] },
        Amount: { number: parseFloat(tx.amount) },
        Currency: { select: { name: tx.currency } },
        ...(basescanUrl ? { "Tx Hash": { url: basescanUrl } } : {}),
        Chain: { select: { name: tx.chain } },
        Status: {
          select: {
            name:
              tx.status.charAt(0).toUpperCase() + tx.status.slice(1),
          },
        },
        "Discovery Method": { select: { name: tx.discoveryMethod } },
        "Agent ID": { rich_text: [{ text: { content: tx.agentId } }] },
        Timestamp: { date: { start: tx.timestamp } },
      },
    });

    console.log(`✓ Transaction logged: ${tx.service} — $${tx.amount}`);
    return page.id;
  }

  /**
   * Query recent transactions from the ledger
   */
  async getRecentTransactions(
    limit: number = 10
  ): Promise<TransactionRecord[]> {
    if (!this.databaseId) {
      throw new Error("Ledger not initialized");
    }

    const response = await this.client.databases.query({
      database_id: this.databaseId,
      sorts: [{ property: "Timestamp", direction: "descending" }],
      page_size: limit,
    });

    return response.results.map((page: any) => ({
      service: page.properties.Service?.title?.[0]?.text?.content || "",
      provider:
        page.properties.Provider?.rich_text?.[0]?.text?.content || "",
      amount: String(page.properties.Amount?.number || 0),
      currency: page.properties.Currency?.select?.name || "USDC",
      txHash: page.properties["Tx Hash"]?.url || "",
      chain: page.properties.Chain?.select?.name || "Base",
      status: (
        page.properties.Status?.select?.name || "pending"
      ).toLowerCase() as TransactionRecord["status"],
      discoveryMethod:
        page.properties["Discovery Method"]?.select?.name || "Direct",
      agentId:
        page.properties["Agent ID"]?.rich_text?.[0]?.text?.content || "",
      timestamp: page.properties.Timestamp?.date?.start || "",
    }));
  }

  /**
   * Generate a spend report from the ledger
   */
  async generateSpendReport(days: number = 30): Promise<SpendReport> {
    if (!this.databaseId) {
      throw new Error("Ledger not initialized");
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const response = await this.client.databases.query({
      database_id: this.databaseId,
      filter: {
        property: "Timestamp",
        date: { on_or_after: since.toISOString() },
      },
    });

    const byProvider: Record<string, number> = {};
    const byService: Record<string, number> = {};
    let totalSpent = 0;

    for (const page of response.results as any[]) {
      const amount = page.properties.Amount?.number || 0;
      const provider =
        page.properties.Provider?.rich_text?.[0]?.text?.content ||
        "Unknown";
      const service =
        page.properties.Service?.title?.[0]?.text?.content || "Unknown";

      totalSpent += amount;
      byProvider[provider] = (byProvider[provider] || 0) + amount;
      byService[service] = (byService[service] || 0) + amount;
    }

    return {
      totalSpent,
      transactionCount: response.results.length,
      byProvider,
      byService,
      period: `${days} days`,
    };
  }

  /**
   * Create a spend summary page in Notion with the report
   */
  async createSpendSummaryPage(report: SpendReport): Promise<string> {
    const providerRows = Object.entries(report.byProvider)
      .map(([name, amount]) => `| ${name} | $${amount.toFixed(2)} |`)
      .join("\n");

    const serviceRows = Object.entries(report.byService)
      .map(([name, amount]) => `| ${name} | $${amount.toFixed(2)} |`)
      .join("\n");

    const page = await this.client.pages.create({
      parent: { page_id: this.parentPageId },
      properties: {
        title: {
          title: [
            {
              text: {
                content: `Agent Spend Report — ${new Date().toISOString().split("T")[0]}`,
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: "Summary" } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `Total Spent: $${report.totalSpent.toFixed(2)} across ${report.transactionCount} transactions (${report.period})`,
                },
              },
            ],
          },
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [
              { type: "text", text: { content: "Spend by Provider" } },
            ],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: Object.entries(report.byProvider)
                    .map(
                      ([name, amount]) =>
                        `• ${name}: $${amount.toFixed(2)}`
                    )
                    .join("\n"),
                },
              },
            ],
          },
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [
              { type: "text", text: { content: "Spend by Service" } },
            ],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: Object.entries(report.byService)
                    .map(
                      ([name, amount]) =>
                        `• ${name}: $${amount.toFixed(2)}`
                    )
                    .join("\n"),
                },
              },
            ],
          },
        },
      ],
    });

    console.log(`✓ Spend report page created`);
    return page.id;
  }
}
