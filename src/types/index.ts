export type IndexType = "CUSTOM" | "PREBUILT";

export interface MarketIndex {
  id: number;
  name: string;
  description?: string;
  type: IndexType;
  selected_markets: string[];
  currency: string;
  item_count: number;
  latest_price: number | null;
  items?: Item[];
}

export interface Item {
  id: number;
  market_hash_name: string;
  type: string;
}

export interface PricePoint {
  timestamp: string;
  value: number;
  item_count?: number;
}

export interface ChartData {
  index_id: number;
  index_name: string;
  currency: string;
  days: number;
  item_count: number;
  markets_used: string[];
  data_points: PricePoint[];
}

export interface CreateIndexPayload {
  name: string;
  description?: string;
  selected_markets: string[];
  currency: string;
  item_ids: number[];
}

export interface Market {
  id: string;
  name: string;
  displayName: string;
}

export type TimeRange = "7" | "30" | "90" | "180" | "365" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}
