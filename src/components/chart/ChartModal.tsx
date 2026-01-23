import { useState, useEffect, useMemo } from "react";
import { Loader2, Clock, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PriceChart } from "./PriceChart";
import { ChartData, TimeRange } from "@/types";
import * as api from "@/api/client";
import { formatRelativeTime, filterPricePointsByDays, filterPricePointsByDateRange } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";

interface ChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indexId: number;
  indexName: string;
  cachedData: PricePoint[] | null;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
  { value: "180", label: "180 Days" },
  { value: "365", label: "1 Year" },
];

// Maximum days to load
const MAX_DAYS = 365;

interface CachedChartData {
  fullData: ChartData;
  loadedAt: Date;
}

export function ChartModal({ open, onOpenChange, indexId, indexName, cachedData: propsData }: ChartModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [loadedData, setLoadedData] = useState<CachedChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use cached data from props if available, otherwise use loaded data
  const fullData = useMemo(() => {
    if (propsData && propsData.length > 0) {
      // Convert PricePoint[] to ChartData format
      return {
        index_id: indexId,
        index_name: indexName,
        currency: "USD",
        days: MAX_DAYS,
        item_count: 0,
        markets_used: [],
        data_points: propsData,
      };
    }
    return loadedData?.fullData || null;
  }, [propsData, loadedData, indexId, indexName]);

  // Filter data based on selected time range (client-side only)
  const chartData = useMemo(() => {
    if (!fullData) return null;

    let filteredPoints;
    let days;

    if (timeRange === "custom" && customDateRange?.from && customDateRange?.to) {
      filteredPoints = filterPricePointsByDateRange(
        fullData.data_points,
        customDateRange.from,
        customDateRange.to
      );
      // Calculate days for display
      days = Math.ceil(
        (customDateRange.to.getTime() - customDateRange.from.getTime()) / (1000 * 60 * 60 * 24)
      );
    } else {
      days = parseInt(timeRange) || 30;
      filteredPoints = filterPricePointsByDays(fullData.data_points, days);
    }

    return {
      ...fullData,
      days,
      data_points: filteredPoints,
    };
  }, [fullData, timeRange, customDateRange]);

  // Determine when data was loaded
  const loadedAt = useMemo(() => {
    if (propsData && propsData.length > 0) {
      return new Date(); // Use current time for cached data from Dashboard
    }
    return loadedData?.loadedAt || null;
  }, [propsData, loadedData]);

  // Load full data only when modal opens and no cached data is available
  useEffect(() => {
    if (open && indexId && !propsData && !loadedData) {
      loadChartData();
    }
  }, [open, indexId, propsData, loadedData]);

  const loadChartData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load full year of data using robust endpoint with illiquidity handling
      const response = await api.getRobustSalesHistory(indexId, MAX_DAYS);
      const data: ChartData = {
        index_id: response.index_id,
        index_name: response.index_name,
        currency: response.currency,
        days: response.days,
        item_count: response.item_count,
        markets_used: response.markets_used,
        data_points: response.data_points.map((dp) => ({
          timestamp: dp.timestamp,
          value: dp.value,
        })),
      };
      setLoadedData({
        fullData: data,
        loadedAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoadedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Time range change only filters client-side (no API calls)
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    // Data is automatically filtered via useMemo above
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">{indexName}</DialogTitle>
              {loadedAt && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatRelativeTime(loadedAt)}</span>
                </div>
              )}
            </div>
            {fullData && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadChartData}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleTimeRangeChange(range.value)}
              disabled={isLoading}
              className={cn(
                "transition-all",
                timeRange === range.value && "shadow-glow"
              )}
            >
              {range.label}
            </Button>
          ))}
          <Button
            variant={timeRange === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => handleTimeRangeChange("custom")}
            disabled={isLoading}
            className={cn(
              "transition-all",
              timeRange === "custom" && "shadow-glow"
            )}
          >
            Custom
          </Button>
          {timeRange === "custom" && (
            <DateRangePicker
              value={customDateRange}
              onChange={setCustomDateRange}
              className="ml-2"
            />
          )}
        </div>

        {/* Chart Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
              <p className="text-xs text-muted-foreground">
                Loading 1 year history with robust price calculation
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={loadChartData}>
                Retry
              </Button>
            </div>
          ) : chartData && chartData.data_points.length > 0 ? (
            <PriceChart data={chartData} />
          ) : (
            <p className="text-muted-foreground">No data available for this time range</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
