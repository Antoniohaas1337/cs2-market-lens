/**
 * Custom hook for loading chart data with SSE streaming progress updates.
 * Integrates with TanStack Query cache for persistence across navigation.
 */

import { useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PricePoint } from "@/types";
import * as api from "@/api/client";
import { queryKeys } from "./queries";

export interface IndexItemProgress {
  completed: number;
  total: number;
}

export interface LoadedData {
  data: PricePoint[];
  loadedAt: Date;
}

const MAX_DAYS = 365;

/**
 * Hook to manage chart data loading with SSE progress and TanStack Query caching.
 *
 * Unlike regular queries, this hook:
 * - Uses SSE streaming for real-time progress updates
 * - Manually populates the query cache when loading completes
 * - Provides fine-grained control over when to load data
 */
export function useChartDataLoader() {
  const queryClient = useQueryClient();
  const [loadingIndices, setLoadingIndices] = useState<Set<number>>(new Set());
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(
    new Set()
  );
  const [itemProgress, setItemProgress] = useState<
    Record<number, IndexItemProgress>
  >({});
  const [isReloading, setIsReloading] = useState(false);

  // Store cleanup functions for active streams
  const cleanupRefs = useRef<Map<number, () => void>>(new Map());

  /**
   * Get cached chart data for an index from the query cache.
   */
  const getCachedData = useCallback(
    (indexId: number): LoadedData | undefined => {
      return queryClient.getQueryData<LoadedData>(
        queryKeys.prices.robust(indexId, MAX_DAYS)
      );
    },
    [queryClient]
  );

  /**
   * Get all cached chart data as a map.
   */
  const getAllCachedData = useCallback((): Record<number, LoadedData> => {
    const cache: Record<number, LoadedData> = {};
    const queries = queryClient.getQueriesData<LoadedData>({
      queryKey: ["prices", "robust"],
    });
    queries.forEach(([key, data]) => {
      if (data && Array.isArray(key) && typeof key[2] === "number") {
        cache[key[2]] = data;
      }
    });
    return cache;
  }, [queryClient]);

  /**
   * Load chart data for a single index with SSE progress updates.
   * Returns the loaded data or null on error.
   */
  const loadSingleIndex = useCallback(
    async (indexId: number): Promise<PricePoint[] | null> => {
      // Mark as loading
      setLoadingIndices((prev) => new Set(prev).add(indexId));

      return new Promise((resolve) => {
        const cleanup = api.getRobustSalesHistoryStream(indexId, MAX_DAYS, {
          onProgress: (completed, total) => {
            setItemProgress((prev) => ({
              ...prev,
              [indexId]: { completed, total },
            }));
          },
          onComplete: (response) => {
            // Clear progress
            setItemProgress((prev) => {
              const next = { ...prev };
              delete next[indexId];
              return next;
            });

            const pricePoints: PricePoint[] = response.data_points.map(
              (point) => ({
                timestamp: point.timestamp,
                value: point.value,
              })
            );

            const loadedData: LoadedData = {
              data: pricePoints,
              loadedAt: new Date(),
            };

            // Store in TanStack Query cache
            queryClient.setQueryData(
              queryKeys.prices.robust(indexId, MAX_DAYS),
              loadedData
            );

            // Update states
            setCompletedIndices((prev) => new Set(prev).add(indexId));
            setLoadingIndices((prev) => {
              const next = new Set(prev);
              next.delete(indexId);
              return next;
            });
            cleanupRefs.current.delete(indexId);

            resolve(pricePoints);
          },
          onError: (message) => {
            console.error(
              `Failed to load chart data for index ${indexId}:`,
              message
            );

            // Clear progress
            setItemProgress((prev) => {
              const next = { ...prev };
              delete next[indexId];
              return next;
            });

            setLoadingIndices((prev) => {
              const next = new Set(prev);
              next.delete(indexId);
              return next;
            });
            cleanupRefs.current.delete(indexId);

            resolve(null);
          },
        });

        // Store cleanup function
        cleanupRefs.current.set(indexId, cleanup);
      });
    },
    [queryClient]
  );

  /**
   * Load chart data for multiple indices in parallel.
   */
  const loadMultipleIndices = useCallback(
    async (indexIds: number[]): Promise<void> => {
      if (indexIds.length === 0) return;

      setIsReloading(true);
      setLoadingIndices(new Set(indexIds));
      setCompletedIndices(new Set());

      try {
        await Promise.all(indexIds.map((id) => loadSingleIndex(id)));
      } finally {
        setIsReloading(false);
        setLoadingIndices(new Set());
      }
    },
    [loadSingleIndex]
  );

  /**
   * Clear cached data for a specific index.
   */
  const clearCache = useCallback(
    (indexId: number) => {
      queryClient.removeQueries({
        queryKey: queryKeys.prices.robust(indexId, MAX_DAYS),
      });
    },
    [queryClient]
  );

  /**
   * Cancel any active loading for an index.
   */
  const cancelLoading = useCallback((indexId: number) => {
    const cleanup = cleanupRefs.current.get(indexId);
    if (cleanup) {
      cleanup();
      cleanupRefs.current.delete(indexId);
    }
    setLoadingIndices((prev) => {
      const next = new Set(prev);
      next.delete(indexId);
      return next;
    });
    setItemProgress((prev) => {
      const next = { ...prev };
      delete next[indexId];
      return next;
    });
  }, []);

  /**
   * Cancel all active loading.
   */
  const cancelAll = useCallback(() => {
    cleanupRefs.current.forEach((cleanup) => cleanup());
    cleanupRefs.current.clear();
    setLoadingIndices(new Set());
    setItemProgress({});
    setIsReloading(false);
  }, []);

  /**
   * Reset completed indices tracking.
   */
  const resetCompleted = useCallback(() => {
    setCompletedIndices(new Set());
  }, []);

  return {
    // State
    loadingIndices,
    completedIndices,
    itemProgress,
    isReloading,

    // Cache access
    getCachedData,
    getAllCachedData,

    // Actions
    loadSingleIndex,
    loadMultipleIndices,
    clearCache,
    cancelLoading,
    cancelAll,
    resetCompleted,
  };
}
