import { useState, useCallback, useMemo, useEffect } from "react";
import { RefreshCw, BarChart3, Loader2, Clock } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { IndexOverviewCard } from "@/components/overview/IndexOverviewCard";
import { ChartModal } from "@/components/chart/ChartModal";
import { LargeIndexWarningDialog } from "@/components/dashboard/LargeIndexWarningDialog";
import { LoadingProgress } from "@/components/dashboard/LoadingProgress";
import { useIndicesQuery } from "@/hooks/queries";
import { useChartDataLoader } from "@/hooks/useChartData";
import { useDashboard } from "@/contexts/DashboardContext";
import { MarketIndex, TimeRange, PricePoint } from "@/types";
import {
  formatRelativeTime,
  filterPricePointsByDays,
  filterPricePointsByDateRange,
} from "@/lib/dateUtils";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "180", label: "180D" },
  { value: "365", label: "1Y" },
];

export default function Dashboard() {
  // Indices data from TanStack Query (cached across navigation)
  const { data: indices = [], isLoading: indicesLoading } = useIndicesQuery();

  // Chart data loader with SSE progress and TanStack Query caching
  const {
    loadingIndices,
    completedIndices,
    itemProgress,
    isReloading,
    getAllCachedData,
    loadSingleIndex,
    loadMultipleIndices,
    clearCache,
    resetCompleted,
  } = useChartDataLoader();

  // UI state from context
  const {
    enabledIndices,
    setEnabledIndices,
    shownLargeIndexWarning,
    setShownLargeIndexWarning,
  } = useDashboard();

  // Local UI state
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [customDateRange, setCustomDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [chartModalIndex, setChartModalIndex] = useState<MarketIndex | null>(
    null
  );
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [pendingToggleIndex, setPendingToggleIndex] =
    useState<MarketIndex | null>(null);
  const [previousEnabledCount, setPreviousEnabledCount] = useState(0);

  // Get cached data map from query cache
  const cachedDataMap = getAllCachedData();

  // Filter cached data based on selected time range (client-side only)
  const chartDataMap = useMemo(() => {
    const filtered: Record<number, PricePoint[]> = {};

    Object.entries(cachedDataMap).forEach(([indexId, cached]) => {
      if (
        timeRange === "custom" &&
        customDateRange?.from &&
        customDateRange?.to
      ) {
        filtered[Number(indexId)] = filterPricePointsByDateRange(
          cached.data,
          customDateRange.from,
          customDateRange.to
        );
      } else {
        const days = parseInt(timeRange) || 30;
        filtered[Number(indexId)] = filterPricePointsByDays(cached.data, days);
      }
    });

    return filtered;
  }, [cachedDataMap, timeRange, customDateRange]);

  // Get the oldest "loaded at" timestamp to show when data was last refreshed
  const lastUpdated = useMemo(() => {
    const timestamps = Object.values(cachedDataMap).map((c) =>
      c.loadedAt.getTime()
    );
    if (timestamps.length === 0) return null;
    return new Date(Math.min(...timestamps));
  }, [cachedDataMap]);

  // Reload all enabled indices
  const reloadAllData = useCallback(async () => {
    if (indices.length === 0) return;

    // Only load enabled indices
    const indicesToLoad = indices
      .filter((i) => enabledIndices.has(i.id))
      .map((i) => i.id);

    if (indicesToLoad.length === 0) return;

    resetCompleted();
    await loadMultipleIndices(indicesToLoad);
  }, [indices, enabledIndices, loadMultipleIndices, resetCompleted]);

  // Time range change now only filters client-side (no API calls)
  const handleTimeRangeChange = useCallback((newRange: TimeRange) => {
    setTimeRange(newRange);
  }, []);

  // Toggle handler for enabling/disabling indices
  const handleToggleIndex = useCallback(
    (indexId: number, enabled: boolean) => {
      const index = indices.find((i) => i.id === indexId);

      if (enabled && index && index.item_count > 100) {
        // Check if user has disabled warnings
        const hideWarning =
          localStorage.getItem("hideLargeIndexWarning") === "true";

        if (!hideWarning) {
          // Show warning dialog
          setPendingToggleIndex(index);
          setWarningDialogOpen(true);
          return; // Don't enable yet, wait for confirmation
        }
      }

      // Enable or disable the index
      setEnabledIndices((prev) => {
        const next = new Set(prev);
        if (enabled) {
          next.add(indexId);
        } else {
          next.delete(indexId);
          // Also clear cached data for disabled index
          clearCache(indexId);
        }
        return next;
      });

      // Mark warning as shown for small visual indicator
      if (enabled && index && index.item_count > 100) {
        setShownLargeIndexWarning((prev) => new Set(prev).add(indexId));
      }
    },
    [indices, setEnabledIndices, clearCache, setShownLargeIndexWarning]
  );

  // Confirm enabling large index from warning dialog
  const handleConfirmLargeIndex = useCallback(() => {
    if (pendingToggleIndex) {
      setEnabledIndices((prev) => new Set(prev).add(pendingToggleIndex.id));
      setShownLargeIndexWarning((prev) =>
        new Set(prev).add(pendingToggleIndex.id)
      );
      setPendingToggleIndex(null);
    }
  }, [pendingToggleIndex, setEnabledIndices, setShownLargeIndexWarning]);

  // Cancel enabling large index from warning dialog
  const handleCancelLargeIndex = useCallback(() => {
    setPendingToggleIndex(null);
  }, []);

  const hasData = Object.keys(cachedDataMap).length > 0;
  const enabledCount = enabledIndices.size;

  // Auto-load newly enabled indices
  useEffect(() => {
    // Check if new indices were enabled (count increased)
    if (enabledCount > previousEnabledCount && previousEnabledCount > 0) {
      // Find newly enabled indices that don't have cached data
      const newlyEnabled = indices.filter(
        (i) => enabledIndices.has(i.id) && !cachedDataMap[i.id]
      );

      if (newlyEnabled.length > 0) {
        loadMultipleIndices(newlyEnabled.map((i) => i.id));
      }
    }
    setPreviousEnabledCount(enabledCount);
  }, [
    enabledCount,
    previousEnabledCount,
    indices,
    enabledIndices,
    cachedDataMap,
    loadMultipleIndices,
  ]);

  // Sort indices: enabled first, then disabled
  const sortedIndices = useMemo(() => {
    return [...indices].sort((a, b) => {
      const aEnabled = enabledIndices.has(a.id);
      const bEnabled = enabledIndices.has(b.id);

      // Enabled indices come first
      if (aEnabled && !bEnabled) return -1;
      if (!aEnabled && bEnabled) return 1;

      // Within same group, maintain original order (by id)
      return a.id - b.id;
    });
  }, [indices, enabledIndices]);

  if (indicesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading indices...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            All indices at a glance with mini-charts
          </p>
          {lastUpdated && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Last updated {formatRelativeTime(lastUpdated)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Time Range Selector */}
          <Tabs
            value={timeRange}
            onValueChange={(v) => {
              handleTimeRangeChange(v as TimeRange);
              if (v !== "custom") {
                setCustomDateRange(undefined);
              }
            }}
          >
            <TabsList className="bg-muted/50">
              {TIME_RANGES.map((range) => (
                <TabsTrigger
                  key={range.value}
                  value={range.value}
                  className="text-xs px-3"
                  disabled={isReloading}
                >
                  {range.label}
                </TabsTrigger>
              ))}
              <TabsTrigger
                value="custom"
                className="text-xs px-3"
                disabled={isReloading}
              >
                Custom
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Custom Date Range Picker */}
          {timeRange === "custom" && (
            <DateRangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
              placeholder="Select date"
            />
          )}

          {/* Reload Button */}
          <Button
            onClick={reloadAllData}
            disabled={isReloading || enabledCount === 0}
            variant="glow"
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`}
            />
            {isReloading
              ? "Loading..."
              : hasData
              ? "Refresh"
              : `Load enabled (${enabledCount})`}
          </Button>
        </div>
      </div>

      {/* Summary Stats - Always visible at top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold text-foreground">
              {indices.length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Indices</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold text-success">
              {hasData
                ? indices.filter((i) => {
                    const data = chartDataMap[i.id];
                    if (!data || data.length < 2) return false;
                    return data[data.length - 1].value > data[0].value;
                  }).length
                : "—"}
            </div>
            <div className="text-sm text-success/70 mt-1">Rising</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold text-destructive">
              {hasData
                ? indices.filter((i) => {
                    const data = chartDataMap[i.id];
                    if (!data || data.length < 2) return false;
                    return data[data.length - 1].value < data[0].value;
                  }).length
                : "—"}
            </div>
            <div className="text-sm text-destructive/70 mt-1">Falling</div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold font-mono text-primary">
              {hasData
                ? `$${Object.values(chartDataMap)
                    .reduce((sum, data) => {
                      if (data && data.length > 0) {
                        return sum + data[data.length - 1].value;
                      }
                      return sum;
                    }, 0)
                    .toLocaleString()}`
                : "—"}
            </div>
            <div className="text-sm text-primary/70 mt-1">Total Value</div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {!hasData && indices.length > 0 && !isReloading && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          {enabledCount === 0 ? (
            <>
              <p className="text-muted-foreground">
                Enable indices with the{" "}
                <span className="text-primary font-medium">toggle switches</span>{" "}
                to load them.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Only enabled indices will be loaded and consume API quota.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                Click{" "}
                <span className="text-primary font-medium">
                  "Load enabled ({enabledCount})"
                </span>{" "}
                to load price data.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Data will be loaded for 1 year and cached locally.
              </p>
            </>
          )}
        </div>
      )}

      {/* Loading Progress */}
      {isReloading && (
        <LoadingProgress
          indices={indices.filter((i) => enabledIndices.has(i.id))}
          loadingIndices={loadingIndices}
          completedIndices={completedIndices}
          completedCount={enabledCount - loadingIndices.size}
          totalCount={enabledCount}
          itemProgress={itemProgress}
        />
      )}

      {/* Index List */}
      <div className="space-y-3">
        {sortedIndices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No indices found. Create your first index!
          </div>
        ) : (
          sortedIndices.map((index) => (
            <IndexOverviewCard
              key={index.id}
              index={index}
              chartData={chartDataMap[index.id] || null}
              isLoading={loadingIndices.has(index.id)}
              onClick={() => setChartModalIndex(index)}
              enabled={enabledIndices.has(index.id)}
              onToggle={(enabled) => handleToggleIndex(index.id, enabled)}
              onRefresh={() => loadSingleIndex(index.id)}
              showLargeIndexWarning={shownLargeIndexWarning.has(index.id)}
              itemProgress={itemProgress[index.id]}
            />
          ))
        )}
      </div>

      {/* Chart Modal */}
      {chartModalIndex && (
        <ChartModal
          open={!!chartModalIndex}
          onOpenChange={(open) => !open && setChartModalIndex(null)}
          indexId={chartModalIndex.id}
          indexName={chartModalIndex.name}
          cachedData={cachedDataMap[chartModalIndex.id]?.data || null}
        />
      )}

      {/* Large Index Warning Dialog */}
      {pendingToggleIndex && (
        <LargeIndexWarningDialog
          open={warningDialogOpen}
          onOpenChange={setWarningDialogOpen}
          indexName={pendingToggleIndex.name}
          itemCount={pendingToggleIndex.item_count}
          onConfirm={handleConfirmLargeIndex}
          onCancel={handleCancelLargeIndex}
        />
      )}
    </div>
  );
}
