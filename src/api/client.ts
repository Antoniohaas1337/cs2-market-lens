/**
 * API Client for CS:GO Market Index Tracker Backend
 */

// In development, use the Vite proxy (requests to /api are forwarded to backend)
// In production, use the configured API URL or default to same origin
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ==================== Types ====================

export interface IndexResponse {
  id: number;
  name: string;
  description: string | null;
  type: 'CUSTOM' | 'PREBUILT';
  category: string | null;
  selected_markets: string[];
  currency: string;
  item_count: number;
  created_at: string;
  updated_at: string;
  latest_price: number | null;
}

export interface IndexDetailResponse extends IndexResponse {
  items: ItemDetail[];
}

interface ItemDetail {
  id: number;
  market_hash_name: string;
  type: string | null;
  category: string | null;
  weapon: string | null;
  exterior: string | null;
  icon_url: string | null;
}

export interface IndexListResponse {
  indices: IndexResponse[];
  total: number;
}

export interface ItemResponse {
  id: number;
  market_hash_name: string;
  hash_name: string;
  nameid: number | null;
  classid: string | null;
  exterior: string | null;
  category: string | null;
  weapon: string | null;
  type: string | null;
  quality: string | null;
  collection: string | null;
  min_float: number | null;
  max_float: number | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemSearchResponse {
  items: ItemResponse[];
  query: string;
  count: number;
}

export interface MarketResponse {
  id: string;
  name: string;
}

export interface MarketsListResponse {
  markets: MarketResponse[];
}

export interface PricePointResponse {
  timestamp: string;
  value: number;
  currency: string;
  item_count: number;
  markets_used: string[];
}

export interface PriceHistoryResponse {
  index_id: number;
  index_name: string;
  currency: string;
  data_points: PricePointResponse[];
}

export interface PriceCalculationResponse {
  index_id: number;
  timestamp: string;
  value: number;
  currency: string;
  item_count: number;
  items_succeeded: number;
  items_failed: number;
  markets_used: string[];
}

export interface SalesHistoryResponse {
  index_id: number;
  index_name: string;
  currency: string;
  days: number;
  item_count: number;
  markets_used: string[];
  data_points: Array<{
    timestamp: string;
    value: number;
  }>;
}

// Legacy alias for backwards compatibility
export type ListingsHistoryResponse = SalesHistoryResponse;

export interface RobustSalesHistoryResponse {
  index_id: number;
  index_name: string;
  currency: string;
  days: number;
  item_count: number;
  markets_used: string[];
  data_points: Array<{
    timestamp: string;
    value: number;
    items_with_data: number;
    items_carried_forward: number;
    items_skipped: number;
  }>;
  config: {
    outlier_threshold: number;
    stale_days: number;
  };
}

export interface CreateIndexPayload {
  name: string;
  description?: string;
  type: 'CUSTOM';
  selected_markets: string[];
  currency: string;
  item_ids: number[];
}

export interface UpdateIndexPayload {
  name?: string;
  description?: string;
  selected_markets?: string[];
  currency?: string;
  item_ids?: number[];
}

export interface ProgressUpdate {
  completed: number;
  total: number;
  percentage: number;
}

export interface SalesHistoryStreamCallbacks {
  onProgress?: (progress: ProgressUpdate) => void;
  onData?: (data: SalesHistoryResponse) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

// Legacy alias
export type ListingsHistoryStreamCallbacks = SalesHistoryStreamCallbacks;

// ==================== API Functions ====================

// --- Indices ---

export async function getIndices(): Promise<IndexListResponse> {
  return fetchApi<IndexListResponse>('/api/indices/');
}

export async function getIndex(id: number): Promise<IndexDetailResponse> {
  return fetchApi<IndexDetailResponse>(`/api/indices/${id}`);
}

export async function createIndex(data: CreateIndexPayload): Promise<IndexResponse> {
  return fetchApi<IndexResponse>('/api/indices/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIndex(id: number, data: UpdateIndexPayload): Promise<IndexResponse> {
  return fetchApi<IndexResponse>(`/api/indices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteIndex(id: number): Promise<void> {
  await fetchApi<{ message: string }>(`/api/indices/${id}`, {
    method: 'DELETE',
  });
}

// --- Items ---

export async function searchItems(query: string, limit: number = 20): Promise<ItemSearchResponse> {
  return fetchApi<ItemSearchResponse>(`/api/items/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function getItem(id: number): Promise<ItemResponse> {
  return fetchApi<ItemResponse>(`/api/items/${id}`);
}

// --- Markets ---

export async function getMarkets(): Promise<MarketsListResponse> {
  return fetchApi<MarketsListResponse>('/api/markets/');
}

// --- Prices ---

export async function calculatePrice(indexId: number): Promise<PriceCalculationResponse> {
  return fetchApi<PriceCalculationResponse>(`/api/prices/${indexId}/calculate`, {
    method: 'POST',
  });
}

export async function getPriceHistory(
  indexId: number,
  options?: { start?: string; end?: string; limit?: number }
): Promise<PriceHistoryResponse> {
  const params = new URLSearchParams();
  if (options?.start) params.append('start', options.start);
  if (options?.end) params.append('end', options.end);
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const endpoint = `/api/prices/${indexId}/history${queryString ? `?${queryString}` : ''}`;

  return fetchApi<PriceHistoryResponse>(endpoint);
}

export async function getSalesHistory(
  indexId: number,
  days: number = 30
): Promise<SalesHistoryResponse> {
  return fetchApi<SalesHistoryResponse>(`/api/prices/${indexId}/sales-history?days=${days}`);
}

// Legacy alias for backwards compatibility
export const getListingsHistory = getSalesHistory;

/**
 * Fetch sales history with real-time progress updates via SSE
 */
export function getSalesHistoryStream(
  indexId: number,
  days: number = 30,
  callbacks: SalesHistoryStreamCallbacks
): () => void {
  const url = `${API_BASE_URL}/api/prices/${indexId}/sales-history-stream?days=${days}`;
  const eventSource = new EventSource(url);

  eventSource.addEventListener('progress', (event) => {
    try {
      const progress: ProgressUpdate = JSON.parse(event.data);
      callbacks.onProgress?.(progress);
    } catch (err) {
      console.error('Failed to parse progress event:', err);
    }
  });

  eventSource.addEventListener('data', (event) => {
    try {
      const data: SalesHistoryResponse = JSON.parse(event.data);
      callbacks.onData?.(data);
    } catch (err) {
      console.error('Failed to parse data event:', err);
    }
  });

  eventSource.addEventListener('complete', () => {
    callbacks.onComplete?.();
    eventSource.close();
  });

  eventSource.addEventListener('error', (event: any) => {
    try {
      const errorData = JSON.parse(event.data || '{}');
      callbacks.onError?.(errorData.error || 'Unknown error');
    } catch {
      callbacks.onError?.('Connection error');
    }
    eventSource.close();
  });

  eventSource.onerror = () => {
    callbacks.onError?.('Connection failed');
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// Legacy alias for backwards compatibility
export const getListingsHistoryStream = getSalesHistoryStream;

export async function getLatestPrice(indexId: number): Promise<{
  index_id: number;
  latest_price: PricePointResponse | null;
  has_data: boolean;
}> {
  return fetchApi(`/api/prices/${indexId}/latest`);
}

/**
 * Fetch robust sales history with illiquidity handling.
 *
 * Features:
 * - Carry-forward for missing days
 * - Outlier removal (configurable threshold)
 * - Volume-weighted price aggregation
 * - Stale data handling
 */
export async function getRobustSalesHistory(
  indexId: number,
  days: number = 30,
  options?: {
    outlierThreshold?: number;
    staleDays?: number;
  }
): Promise<RobustSalesHistoryResponse> {
  const params = new URLSearchParams({ days: days.toString() });
  if (options?.outlierThreshold !== undefined) {
    params.append('outlier_threshold', options.outlierThreshold.toString());
  }
  if (options?.staleDays !== undefined) {
    params.append('stale_days', options.staleDays.toString());
  }
  return fetchApi<RobustSalesHistoryResponse>(
    `/api/prices/${indexId}/robust-sales-history?${params}`
  );
}
