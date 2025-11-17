
export interface SaleData {
  date: string;
  sales: number;
  forecast?: number;
}

export interface PricingData {
  name: string;
  currentPrice: number;
  optimalPrice: number;
  competitorPrice: number;
}

export interface InventoryData {
  date: string;
  level: number;
  reorderPoint: number;
}

export interface PortfolioData {
  name: string;
  profit: number;
  salesVolume: number;
  profitMargin: number;
}

export interface Recommendation {
    title: string;
    explanation: string;
    nextStep: string;
}

export enum AnalyticsType {
    SalesForecast = 'Sales Forecast',
    OptimalPricing = 'Optimal Pricing',
    InventoryAnalysis = 'Inventory Analysis',
    PortfolioOptimization = 'Portfolio Optimization',
    CampaignSuggestion = 'Campaign Suggestion',
    CompetitorWatch = 'Competitor Watch',
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}