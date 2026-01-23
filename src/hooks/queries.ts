/**
 * TanStack Query hooks for data fetching with automatic caching
 *
 * Benefits:
 * - Data persists across navigation (stays in cache)
 * - Automatic deduplication of requests
 * - Background refetching when data goes stale
 * - Optimistic updates for mutations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MarketIndex, Item, Market, PricePoint } from "@/types";
import * as api from "@/api/client";

// ==================== Query Keys ====================
// Centralized query keys for cache management

export const queryKeys = {
  indices: {
    all: ["indices"] as const,
    detail: (id: number) => ["indices", id] as const,
  },
  markets: {
    all: ["markets"] as const,
  },
  items: {
    search: (query: string) => ["items", "search", query] as const,
    aggregations: (filters?: api.ItemFilterRequest) =>
      ["items", "aggregations", filters] as const,
    filter: (filters: api.ItemFilterRequest, page: number) =>
      ["items", "filter", filters, page] as const,
  },
  prices: {
    history: (indexId: number, days: number) =>
      ["prices", "history", indexId, days] as const,
    robust: (indexId: number, days: number) =>
      ["prices", "robust", indexId, days] as const,
  },
};

// ==================== Transform Functions ====================

const transformIndex = (
  apiIndex: api.IndexResponse | api.IndexDetailResponse
): MarketIndex => {
  const items =
    "items" in apiIndex && apiIndex.items
      ? apiIndex.items.map((item) => ({
          id: item.id,
          market_hash_name: item.market_hash_name,
          type: item.type || "Unknown",
        }))
      : undefined;

  const selectedMarkets = Array.isArray(apiIndex.selected_markets)
    ? apiIndex.selected_markets
    : [];

  return {
    id: apiIndex.id,
    name: apiIndex.name,
    description: apiIndex.description || undefined,
    type: apiIndex.type,
    selected_markets: selectedMarkets,
    currency: apiIndex.currency,
    item_count: apiIndex.item_count,
    latest_price: apiIndex.latest_price,
    items,
  };
};

const transformMarket = (apiMarket: api.MarketResponse): Market => ({
  id: apiMarket.id,
  name: apiMarket.id,
  displayName: apiMarket.name,
});

// ==================== Indices Hooks ====================

/**
 * Fetch all indices with caching
 */
export function useIndicesQuery() {
  return useQuery({
    queryKey: queryKeys.indices.all,
    queryFn: async () => {
      const response = await api.getIndices();
      return response.indices.map(transformIndex);
    },
  });
}

/**
 * Fetch a single index by ID with caching
 */
export function useIndexQuery(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.indices.detail(id!),
    queryFn: async () => {
      const response = await api.getIndex(id!);
      return transformIndex(response);
    },
    enabled: !!id,
  });
}

/**
 * Create a new index
 */
export function useCreateIndexMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      selectedMarkets: string[];
      selectedItems: Item[];
    }) => {
      const payload: api.CreateIndexPayload = {
        name: data.name,
        description: data.description || undefined,
        type: "CUSTOM",
        selected_markets: data.selectedMarkets,
        currency: "USD",
        item_ids: data.selectedItems.map((item) => item.id),
      };

      const response = await api.createIndex(payload);
      const newIndex = transformIndex(response);
      newIndex.items = data.selectedItems;
      return newIndex;
    },
    onSuccess: (newIndex) => {
      // Add the new index to the cache
      queryClient.setQueryData<MarketIndex[]>(
        queryKeys.indices.all,
        (old) => (old ? [...old, newIndex] : [newIndex])
      );
    },
  });
}

/**
 * Update an existing index
 */
export function useUpdateIndexMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        name: string;
        description: string;
        selectedMarkets: string[];
        selectedItems: Item[];
      };
    }) => {
      const payload: api.UpdateIndexPayload = {
        name: data.name,
        description: data.description || undefined,
        selected_markets: data.selectedMarkets,
        item_ids: data.selectedItems.map((item) => item.id),
      };

      const response = await api.updateIndex(id, payload);
      const updatedIndex = transformIndex(response);
      updatedIndex.items = data.selectedItems;
      return updatedIndex;
    },
    onSuccess: (updatedIndex) => {
      // Update the index in the list cache
      queryClient.setQueryData<MarketIndex[]>(queryKeys.indices.all, (old) =>
        old?.map((index) =>
          index.id === updatedIndex.id ? updatedIndex : index
        )
      );
      // Update the detail cache
      queryClient.setQueryData(
        queryKeys.indices.detail(updatedIndex.id),
        updatedIndex
      );
      // Invalidate price history caches for this index
      queryClient.invalidateQueries({
        queryKey: ["prices", "history", updatedIndex.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["prices", "robust", updatedIndex.id],
      });
    },
  });
}

/**
 * Delete an index
 */
export function useDeleteIndexMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.deleteIndex(id);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove from list cache
      queryClient.setQueryData<MarketIndex[]>(queryKeys.indices.all, (old) =>
        old?.filter((index) => index.id !== deletedId)
      );
      // Remove detail cache
      queryClient.removeQueries({
        queryKey: queryKeys.indices.detail(deletedId),
      });
      // Remove price caches
      queryClient.removeQueries({
        queryKey: ["prices", "history", deletedId],
      });
      queryClient.removeQueries({
        queryKey: ["prices", "robust", deletedId],
      });
    },
  });
}

/**
 * Calculate price for an index
 */
export function useCalculatePriceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.calculatePrice(id);
      return { id, value: response.value };
    },
    onSuccess: ({ id, value }) => {
      // Update the latest_price in the indices list cache
      queryClient.setQueryData<MarketIndex[]>(queryKeys.indices.all, (old) =>
        old?.map((index) =>
          index.id === id ? { ...index, latest_price: value } : index
        )
      );
      // Update detail cache if it exists
      queryClient.setQueryData<MarketIndex>(
        queryKeys.indices.detail(id),
        (old) => (old ? { ...old, latest_price: value } : old)
      );
    },
  });
}

// ==================== Markets Hook ====================

/**
 * Fetch all markets with caching
 */
export function useMarketsQuery() {
  return useQuery({
    queryKey: queryKeys.markets.all,
    queryFn: async () => {
      const response = await api.getMarkets();
      return response.markets.map(transformMarket);
    },
    // Markets rarely change, keep them fresh longer
    staleTime: 30 * 60 * 1000,
  });
}

// ==================== Items Hooks ====================

/**
 * Search items with caching
 */
export function useItemSearchQuery(query: string, limit: number = 20) {
  return useQuery({
    queryKey: queryKeys.items.search(query),
    queryFn: async () => {
      const response = await api.searchItems(query, limit);
      return response.items;
    },
    enabled: query.length >= 2,
    // Search results can go stale faster
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get item aggregations for filters
 */
export function useItemAggregationsQuery(filters?: api.ItemFilterRequest) {
  return useQuery({
    queryKey: queryKeys.items.aggregations(filters),
    queryFn: async () => {
      const response = await api.getItemAggregations(filters);
      return response;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Filter items with pagination
 */
export function useFilterItemsQuery(
  filters: api.ItemFilterRequest,
  page: number = 1,
  limit: number = 100,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.items.filter(filters, page),
    queryFn: async () => {
      const response = await api.filterItems(filters, page, limit);
      return response;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== Price History Hooks ====================

/**
 * Fetch robust sales history with caching.
 * This is the main hook for chart data.
 */
export function useRobustSalesHistoryQuery(
  indexId: number | undefined,
  days: number = 365,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.prices.robust(indexId!, days),
    queryFn: async () => {
      const response = await api.getRobustSalesHistory(indexId!, days);
      // Transform to PricePoint format for charts
      const pricePoints: PricePoint[] = response.data_points.map((dp) => ({
        timestamp: dp.timestamp,
        value: dp.value,
      }));
      return {
        ...response,
        pricePoints,
      };
    },
    enabled: enabled && !!indexId,
    // Chart data can be cached longer
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}

// ==================== Cache Helpers ====================

/**
 * Hook to get query client for manual cache operations
 */
export function useQueryClientHelpers() {
  const queryClient = useQueryClient();

  return {
    /**
     * Invalidate all index-related caches
     */
    invalidateIndices: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.indices.all });
    },

    /**
     * Invalidate price cache for a specific index
     */
    invalidatePriceCache: (indexId: number) => {
      queryClient.invalidateQueries({
        queryKey: ["prices", "history", indexId],
      });
      queryClient.invalidateQueries({
        queryKey: ["prices", "robust", indexId],
      });
    },

    /**
     * Prefetch index data (useful for optimistic loading)
     */
    prefetchIndex: async (id: number) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.indices.detail(id),
        queryFn: async () => {
          const response = await api.getIndex(id);
          return transformIndex(response);
        },
      });
    },

    /**
     * Update latest price in cache without refetching
     */
    updateLatestPrice: (indexId: number, price: number) => {
      queryClient.setQueryData<MarketIndex[]>(queryKeys.indices.all, (old) =>
        old?.map((index) =>
          index.id === indexId ? { ...index, latest_price: price } : index
        )
      );
    },
  };
}
