import { useState, useEffect } from "react";
import { Market } from "@/types";
import * as api from "@/api/client";

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.getMarkets();
        // Transform API response to frontend Market type
        const transformed: Market[] = response.markets.map((market) => ({
          id: market.id,
          name: market.id,
          displayName: market.name,
        }));
        setMarkets(transformed);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch markets';
        setError(message);
        console.error('Failed to fetch markets:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarkets();
  }, []);

  return { markets, isLoading, error };
}
