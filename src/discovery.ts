/**
 * WebMCP Service Discovery — Discovers purchasable services using the WebMCP protocol
 *
 * WebMCP (navigator.modelContext) allows websites to expose structured service
 * metadata to AI agents. This module simulates an agent discovering services
 * that can be purchased via x402 payments.
 *
 * In production, this would scan real WebMCP-enabled sites.
 * For the demo, we use a curated service catalog that mirrors real agent services.
 */

export interface DiscoverableService {
  id: string;
  name: string;
  description: string;
  provider: string;
  providerUrl: string;
  price: string;
  currency: string;
  chain: string;
  paymentAddress: string;
  capabilities: string[];
  discoveredVia: "WebMCP" | "Direct" | "Referral";
}

/**
 * Service catalog — represents services discoverable via WebMCP
 * These mirror real agent services in the AI agent economy
 */
const SERVICE_CATALOG: DiscoverableService[] = [
  {
    id: "code-review-agent",
    name: "Automated Code Review",
    description:
      "AI-powered code review with security scanning and performance analysis",
    provider: "CodeGuard AI",
    providerUrl: "https://codeguard.example.com",
    price: "0.50",
    currency: "USDC",
    chain: "Base",
    paymentAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD1e",
    capabilities: ["security-scan", "perf-analysis", "style-check"],
    discoveredVia: "WebMCP",
  },
  {
    id: "data-enrichment",
    name: "Lead Data Enrichment",
    description:
      "Enrich contact records with company data, social profiles, and tech stack",
    provider: "DataForge",
    providerUrl: "https://dataforge.example.com",
    price: "0.25",
    currency: "USDC",
    chain: "Base",
    paymentAddress: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    capabilities: ["company-data", "social-profiles", "tech-stack"],
    discoveredVia: "WebMCP",
  },
  {
    id: "content-generation",
    name: "SEO Content Generator",
    description:
      "Generate SEO-optimized blog posts, landing pages, and meta descriptions",
    provider: "ContentMill AI",
    providerUrl: "https://contentmill.example.com",
    price: "1.00",
    currency: "USDC",
    chain: "Base",
    paymentAddress: "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
    capabilities: ["blog-posts", "landing-pages", "meta-descriptions"],
    discoveredVia: "WebMCP",
  },
  {
    id: "market-analysis",
    name: "Real-Time Market Analysis",
    description:
      "Crypto and traditional market analysis with sentiment scoring and trend detection",
    provider: "MarketPulse",
    providerUrl: "https://marketpulse.example.com",
    price: "0.75",
    currency: "USDC",
    chain: "Base",
    paymentAddress: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
    capabilities: ["crypto-analysis", "sentiment", "trend-detection"],
    discoveredVia: "WebMCP",
  },
  {
    id: "translation-service",
    name: "Technical Translation",
    description:
      "Translate documentation and UI strings with technical context preservation",
    provider: "LinguaAgent",
    providerUrl: "https://linguaagent.example.com",
    price: "0.30",
    currency: "USDC",
    chain: "Base",
    paymentAddress: "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
    capabilities: ["docs-translation", "ui-strings", "context-aware"],
    discoveredVia: "WebMCP",
  },
];

export class ServiceDiscovery {
  private catalog: DiscoverableService[];

  constructor() {
    this.catalog = SERVICE_CATALOG;
  }

  /**
   * Discover services matching specific capabilities
   * Simulates WebMCP's navigator.modelContext scanning
   */
  async discoverServices(
    capabilities?: string[]
  ): Promise<DiscoverableService[]> {
    console.log(`🔍 Scanning WebMCP-enabled services...`);

    // Simulate network discovery delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!capabilities || capabilities.length === 0) {
      console.log(`✓ Found ${this.catalog.length} services`);
      return this.catalog;
    }

    const matches = this.catalog.filter((service) =>
      capabilities.some((cap) => service.capabilities.includes(cap))
    );

    console.log(
      `✓ Found ${matches.length} services matching: ${capabilities.join(", ")}`
    );
    return matches;
  }

  /**
   * Get a specific service by ID
   */
  async getService(serviceId: string): Promise<DiscoverableService | null> {
    return this.catalog.find((s) => s.id === serviceId) || null;
  }

  /**
   * Evaluate service for purchase decision
   * Agent logic: compare price vs. budget, check capabilities
   */
  async evaluateService(
    service: DiscoverableService,
    budget: number
  ): Promise<{
    shouldPurchase: boolean;
    reason: string;
  }> {
    const price = parseFloat(service.price);

    if (price > budget) {
      return {
        shouldPurchase: false,
        reason: `Price ($${service.price}) exceeds budget ($${budget.toFixed(2)})`,
      };
    }

    return {
      shouldPurchase: true,
      reason: `Service "${service.name}" at $${service.price} is within budget. Capabilities: ${service.capabilities.join(", ")}`,
    };
  }
}
