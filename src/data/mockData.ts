import { MarketIndex, Item, ChartData, Market, PricePoint } from "@/types";

export const AVAILABLE_MARKETS: Market[] = [
  { id: "STEAMCOMMUNITY", name: "STEAMCOMMUNITY", displayName: "Steam Community" },
  { id: "SKINPORT", name: "SKINPORT", displayName: "Skinport" },
  { id: "BUFF163", name: "BUFF163", displayName: "Buff163" },
  { id: "CSFLOAT", name: "CSFLOAT", displayName: "CSFloat" },
  { id: "BITSKINS", name: "BITSKINS", displayName: "BitSkins" },
  { id: "DMARKET", name: "DMARKET", displayName: "DMarket" },
];

export const MOCK_ITEMS: Item[] = [
  { id: 1, market_hash_name: "AK-47 | Redline (Field-Tested)", type: "Rifle" },
  { id: 2, market_hash_name: "AWP | Dragon Lore (Factory New)", type: "Sniper Rifle" },
  { id: 3, market_hash_name: "M4A4 | Howl (Factory New)", type: "Rifle" },
  { id: 4, market_hash_name: "★ Karambit | Fade (Factory New)", type: "Knife" },
  { id: 5, market_hash_name: "★ Butterfly Knife | Doppler (Factory New)", type: "Knife" },
  { id: 6, market_hash_name: "Glock-18 | Fade (Factory New)", type: "Pistol" },
  { id: 7, market_hash_name: "Desert Eagle | Blaze (Factory New)", type: "Pistol" },
  { id: 8, market_hash_name: "USP-S | Kill Confirmed (Factory New)", type: "Pistol" },
  { id: 9, market_hash_name: "AK-47 | Fire Serpent (Factory New)", type: "Rifle" },
  { id: 10, market_hash_name: "AWP | Asiimov (Field-Tested)", type: "Sniper Rifle" },
  { id: 11, market_hash_name: "M4A1-S | Printstream (Factory New)", type: "Rifle" },
  { id: 12, market_hash_name: "★ Sport Gloves | Pandora's Box (Factory New)", type: "Gloves" },
  { id: 13, market_hash_name: "★ Specialist Gloves | Crimson Kimono (Factory New)", type: "Gloves" },
  { id: 14, market_hash_name: "Sticker | Titan (Holo) | Katowice 2014", type: "Sticker" },
  { id: 15, market_hash_name: "Sticker | iBUYPOWER (Holo) | Katowice 2014", type: "Sticker" },
  { id: 16, market_hash_name: "Operation Bravo Case", type: "Case" },
  { id: 17, market_hash_name: "CS:GO Weapon Case", type: "Case" },
  { id: 18, market_hash_name: "MP9 | Hypnotic (Factory New)", type: "SMG" },
  { id: 19, market_hash_name: "MAC-10 | Neon Rider (Factory New)", type: "SMG" },
  { id: 20, market_hash_name: "P90 | Asiimov (Factory New)", type: "SMG" },
];

export const MOCK_INDICES: MarketIndex[] = [
  {
    id: 1,
    name: "High-Value AWPs",
    description: "Premium AWP skins collection",
    type: "CUSTOM",
    selected_markets: ["STEAMCOMMUNITY", "SKINPORT", "BUFF163"],
    currency: "USD",
    item_count: 3,
    latest_price: 15420.50,
    items: [MOCK_ITEMS[1], MOCK_ITEMS[9], MOCK_ITEMS[10]],
  },
  {
    id: 2,
    name: "Knife Collection",
    description: "Top-tier knives",
    type: "CUSTOM",
    selected_markets: ["CSFLOAT", "SKINPORT"],
    currency: "USD",
    item_count: 2,
    latest_price: 4250.00,
    items: [MOCK_ITEMS[3], MOCK_ITEMS[4]],
  },
  {
    id: 3,
    name: "Rifles Index",
    type: "PREBUILT",
    selected_markets: ["STEAMCOMMUNITY", "SKINPORT", "BUFF163", "CSFLOAT"],
    currency: "USD",
    item_count: 156,
    latest_price: 82340.00,
  },
  {
    id: 4,
    name: "Pistols Index",
    type: "PREBUILT",
    selected_markets: ["STEAMCOMMUNITY", "SKINPORT"],
    currency: "USD",
    item_count: 89,
    latest_price: 12450.00,
  },
  {
    id: 5,
    name: "Knives Index",
    type: "PREBUILT",
    selected_markets: ["STEAMCOMMUNITY", "SKINPORT", "BUFF163"],
    currency: "USD",
    item_count: 234,
    latest_price: null,
  },
  {
    id: 6,
    name: "Gloves Index",
    type: "PREBUILT",
    selected_markets: ["CSFLOAT", "SKINPORT"],
    currency: "USD",
    item_count: 78,
    latest_price: 45600.00,
  },
];

// Generate mock price history
function generatePriceHistory(days: number, basePrice: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();
  const pointCount = Math.min(days * 2, 80);
  const intervalMs = (days * 24 * 60 * 60 * 1000) / pointCount;

  let currentPrice = basePrice * 0.9;

  for (let i = pointCount; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    // Random walk with slight upward trend
    const change = (Math.random() - 0.45) * (basePrice * 0.02);
    currentPrice = Math.max(currentPrice + change, basePrice * 0.7);
    
    points.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(currentPrice * 100) / 100,
      item_count: 3,
    });
  }

  return points;
}

export function getMockChartData(indexId: number, days: number): ChartData {
  const index = MOCK_INDICES.find((i) => i.id === indexId);
  const basePrice = index?.latest_price || 10000;

  return {
    index_id: indexId,
    index_name: index?.name || "Unknown Index",
    currency: "USD",
    days,
    item_count: index?.item_count || 0,
    markets_used: index?.selected_markets || [],
    data_points: generatePriceHistory(days, basePrice),
  };
}

export function searchItems(query: string): Item[] {
  if (query.length < 3) return [];
  const lowerQuery = query.toLowerCase();
  return MOCK_ITEMS.filter(
    (item) =>
      item.market_hash_name.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery)
  );
}
