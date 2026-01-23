/**
 * Dashboard UI State Context
 *
 * Manages UI-only state that needs to persist across navigation:
 * - Which indices are enabled/disabled
 * - Large index warning tracking
 *
 * Note: Actual data caching is now handled by TanStack Query.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type SetStateAction<S> = S | ((prevState: S) => S);

interface DashboardContextType {
  // Enabled/disabled state for indices (persisted in localStorage)
  enabledIndices: Set<number>;
  setEnabledIndices: (indices: SetStateAction<Set<number>>) => void;

  // Track whether large index warning was shown
  shownLargeIndexWarning: Set<number>;
  setShownLargeIndexWarning: (warnings: SetStateAction<Set<number>>) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children }: { children: ReactNode }) {
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

  // Track whether large index warning was shown (session only, not persisted)
  const [shownLargeIndexWarning, setShownLargeIndexWarning] = useState<
    Set<number>
  >(new Set());

  // Save enabled indices to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "enabledIndices",
      JSON.stringify(Array.from(enabledIndices))
    );
  }, [enabledIndices]);

  return (
    <DashboardContext.Provider
      value={{
        enabledIndices,
        setEnabledIndices,
        shownLargeIndexWarning,
        setShownLargeIndexWarning,
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
