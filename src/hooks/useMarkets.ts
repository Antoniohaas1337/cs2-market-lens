/**
 * Hook for fetching markets with TanStack Query caching.
 * This is a wrapper around useMarketsQuery for backwards compatibility.
 */

import { useMarketsQuery } from "./queries";

export function useMarkets() {
  const { data: markets = [], isLoading, error } = useMarketsQuery();

  return {
    markets,
    isLoading,
    error: error ? (error instanceof Error ? error.message : "Failed to fetch markets") : null,
  };
}
