/**
 * Agent Commerce Loop — Public API
 *
 * Export all modules for use as a library
 */

export { CommerceAgent } from "./agent.js";
export type { AgentConfig, CommerceLoopResult } from "./agent.js";

export { ServiceDiscovery } from "./discovery.js";
export type { DiscoverableService } from "./discovery.js";

export { AgentPayClient } from "./payment.js";
export type { PaymentResult, WalletBalance } from "./payment.js";

export { NotionCommerceClient } from "./notion-client.js";
export type { TransactionRecord, SpendReport } from "./notion-client.js";
