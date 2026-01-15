import { useState, useCallback } from "react";
import { MarketIndex, Item } from "@/types";
import { MOCK_INDICES, MOCK_ITEMS } from "@/data/mockData";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useIndices() {
  const [indices, setIndices] = useState<MarketIndex[]>(MOCK_INDICES);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIndices = useCallback(async () => {
    setIsLoading(true);
    await delay(500);
    setIsLoading(false);
    return indices;
  }, [indices]);

  const getIndex = useCallback(
    async (id: number): Promise<MarketIndex | undefined> => {
      await delay(300);
      return indices.find((i) => i.id === id);
    },
    [indices]
  );

  const createIndex = useCallback(
    async (data: {
      name: string;
      description: string;
      selectedMarkets: string[];
      selectedItems: Item[];
    }): Promise<MarketIndex> => {
      await delay(500);
      const newIndex: MarketIndex = {
        id: Date.now(),
        name: data.name,
        description: data.description || undefined,
        type: "CUSTOM",
        selected_markets: data.selectedMarkets,
        currency: "USD",
        item_count: data.selectedItems.length,
        latest_price: null,
        items: data.selectedItems,
      };
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
      await delay(500);
      let updatedIndex: MarketIndex | undefined;
      setIndices((prev) =>
        prev.map((index) => {
          if (index.id === id) {
            updatedIndex = {
              ...index,
              name: data.name,
              description: data.description || undefined,
              selected_markets: data.selectedMarkets,
              item_count: data.selectedItems.length,
              items: data.selectedItems,
            };
            return updatedIndex;
          }
          return index;
        })
      );
      return updatedIndex;
    },
    []
  );

  const deleteIndex = useCallback(async (id: number): Promise<void> => {
    await delay(300);
    setIndices((prev) => prev.filter((index) => index.id !== id));
  }, []);

  const calculatePrice = useCallback(async (id: number): Promise<number> => {
    await delay(1000);
    // Generate a random price for demo
    const price = Math.round((Math.random() * 50000 + 1000) * 100) / 100;
    setIndices((prev) =>
      prev.map((index) =>
        index.id === id ? { ...index, latest_price: price } : index
      )
    );
    return price;
  }, []);

  return {
    indices,
    isLoading,
    fetchIndices,
    getIndex,
    createIndex,
    updateIndex,
    deleteIndex,
    calculatePrice,
  };
}
