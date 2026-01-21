import { useState, useCallback, useEffect } from "react";
import { MarketIndex, Item } from "@/types";
import * as api from "@/api/client";

export function useIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transform API response to frontend type
  const transformIndex = (apiIndex: api.IndexResponse | api.IndexDetailResponse): MarketIndex => {
    try {
      const items = 'items' in apiIndex && apiIndex.items
        ? apiIndex.items.map((item) => ({
            id: item.id,
            market_hash_name: item.market_hash_name,
            type: item.type || 'Unknown',
          }))
        : undefined;

      // Ensure selected_markets is an array
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
    } catch (error) {
      console.error('Error transforming index:', error, 'apiIndex:', apiIndex);
      throw error;
    }
  };

  // Fetch all indices on mount
  const fetchIndices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getIndices();
      const transformed = response.indices.map(transformIndex);
      setIndices(transformed);
      return transformed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch indices';
      setError(message);
      console.error('Failed to fetch indices:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchIndices();
  }, [fetchIndices]);

  const getIndex = useCallback(
    async (id: number): Promise<MarketIndex | undefined> => {
      try {
        const response = await api.getIndex(id);
        return transformIndex(response);
      } catch (err) {
        console.error('Failed to fetch index:', err);
        return undefined;
      }
    },
    []
  );

  const createIndex = useCallback(
    async (data: {
      name: string;
      description: string;
      selectedMarkets: string[];
      selectedItems: Item[];
    }): Promise<MarketIndex> => {
      const payload: api.CreateIndexPayload = {
        name: data.name,
        description: data.description || undefined,
        type: 'CUSTOM',
        selected_markets: data.selectedMarkets,
        currency: 'USD',
        item_ids: data.selectedItems.map((item) => item.id),
      };

      const response = await api.createIndex(payload);
      const newIndex = transformIndex(response);

      // Add items to the new index for local state
      newIndex.items = data.selectedItems;

      setIndices((prev) => [...prev, newIndex]);
      return newIndex;
    },
    []
  );

  const updateIndex = useCallback(
    async (
      id: number,
      data: {
        name: string;
        description: string;
        selectedMarkets: string[];
        selectedItems: Item[];
      }
    ): Promise<MarketIndex | undefined> => {
      try {
        console.log('Updating index:', id, 'with data:', data);

        const payload: api.UpdateIndexPayload = {
          name: data.name,
          description: data.description || undefined,
          selected_markets: data.selectedMarkets,
          item_ids: data.selectedItems.map((item) => item.id),
        };

        console.log('Update payload:', payload);

        const response = await api.updateIndex(id, payload);
        console.log('Update response:', response);

        const updatedIndex = transformIndex(response);
        updatedIndex.items = data.selectedItems;

        setIndices((prev) =>
          prev.map((index) => (index.id === id ? updatedIndex : index))
        );

        console.log('Index updated successfully');
        return updatedIndex;
      } catch (error) {
        console.error('Error in updateIndex:', error);
        throw error;
      }
    },
    []
  );

  const deleteIndex = useCallback(async (id: number): Promise<void> => {
    await api.deleteIndex(id);
    setIndices((prev) => prev.filter((index) => index.id !== id));
  }, []);

  const calculatePrice = useCallback(async (id: number): Promise<number> => {
    const response = await api.calculatePrice(id);

    setIndices((prev) =>
      prev.map((index) =>
        index.id === id ? { ...index, latest_price: response.value } : index
      )
    );

    return response.value;
  }, []);

  return {
    indices,
    isLoading,
    error,
    fetchIndices,
    getIndex,
    createIndex,
    updateIndex,
    deleteIndex,
    calculatePrice,
  };
}
