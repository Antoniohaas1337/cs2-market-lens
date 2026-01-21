import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PricePoint } from "@/types";

interface CachedData {
  data: PricePoint[];
  loadedAt: Date;
}

interface DashboardContextType {
  cachedDataMap: Record<number, CachedData>;
  setCachedDataMap: (data: Record<number, CachedData>) => void;
  enabledIndices: Set<number>;
  setEnabledIndices: (indices: Set<number>) => void;
  shownLargeIndexWarning: Set<number>;
  setShownLargeIndexWarning: (warnings: Set<number>) => void;
  clearCachedData: (indexId: number) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Cache for chart data
  const [cachedDataMap, setCachedDataMap] = useState<Record<number, CachedData>>({});

  // Enabled/disabled state for indices (persisted in localStorage)
  const [enabledIndices, setEnabledIndices] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("enabledIndices");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return new Set(parsed);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Track whether large index warning was shown
  const [shownLargeIndexWarning, setShownLargeIndexWarning] = useState<Set<number>>(new Set());

  // Save enabled indices to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("enabledIndices", JSON.stringify(Array.from(enabledIndices)));
  }, [enabledIndices]);

  // Helper to clear cached data for a specific index
  const clearCachedData = (indexId: number) => {
    setCachedDataMap((prev) => {
      const next = { ...prev };
      delete next[indexId];
      return next;
    });
  };

  return (
    <DashboardContext.Provider
      value={{
        cachedDataMap,
        setCachedDataMap,
        enabledIndices,
        setEnabledIndices,
        shownLargeIndexWarning,
        setShownLargeIndexWarning,
        clearCachedData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
