import { useState, useCallback } from "react";
import { RefreshCw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndexOverviewCard } from "@/components/overview/IndexOverviewCard";
import { ChartModal } from "@/components/chart/ChartModal";
import { useIndices } from "@/hooks/useIndices";
import { getMockChartData } from "@/data/mockData";
import { MarketIndex, PricePoint, TimeRange } from "@/types";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7", label: "7D" },
  { value: "30", label: "30D" },
  { value: "90", label: "90D" },
  { value: "180", label: "180D" },
  { value: "365", label: "1Y" },
];

export default function Dashboard() {
  const { indices } = useIndices();
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [isReloading, setIsReloading] = useState(false);
  const [chartDataMap, setChartDataMap] = useState<Record<number, PricePoint[]>>({});
  const [loadingIndices, setLoadingIndices] = useState<Set<number>>(new Set());
  const [chartModalIndex, setChartModalIndex] = useState<MarketIndex | null>(null);

  const reloadAllData = useCallback(async () => {
    setIsReloading(true);
    setLoadingIndices(new Set(indices.map((i) => i.id)));

    const days = parseInt(timeRange);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newChartData: Record<number, PricePoint[]> = {};
    for (const index of indices) {
      const data = getMockChartData(index.id, days);
      newChartData[index.id] = data.data_points;
    }

    setChartDataMap(newChartData);
    setLoadingIndices(new Set());
    setIsReloading(false);
  }, [indices, timeRange]);

  const handleTimeRangeChange = useCallback(async (newRange: TimeRange) => {
    setTimeRange(newRange);
    
    if (Object.keys(chartDataMap).length > 0) {
      setIsReloading(true);
      setLoadingIndices(new Set(indices.map((i) => i.id)));

      const days = parseInt(newRange);
      
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newChartData: Record<number, PricePoint[]> = {};
      for (const index of indices) {
        const data = getMockChartData(index.id, days);
        newChartData[index.id] = data.data_points;
      }

      setChartDataMap(newChartData);
      setLoadingIndices(new Set());
      setIsReloading(false);
    }
  }, [indices, chartDataMap]);

  const hasData = Object.keys(chartDataMap).length > 0;

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
            Alle Indizes auf einen Blick mit Mini-Charts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <Tabs value={timeRange} onValueChange={(v) => handleTimeRangeChange(v as TimeRange)}>
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
            </TabsList>
          </Tabs>

          {/* Reload Button */}
          <Button
            onClick={reloadAllData}
            disabled={isReloading}
            variant="glow"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isReloading ? "animate-spin" : ""}`} />
            {isReloading ? "Lädt..." : "Alle laden"}
          </Button>
        </div>
      </div>

      {/* Summary Stats - Always visible at top */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold text-foreground">{indices.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Indizes</div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-success/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold text-success">
              {hasData ? indices.filter((i) => {
                const data = chartDataMap[i.id];
                if (!data || data.length < 2) return false;
                return data[data.length - 1].value > data[0].value;
              }).length : "—"}
            </div>
            <div className="text-sm text-success/70 mt-1">Steigend</div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold text-destructive">
              {hasData ? indices.filter((i) => {
                const data = chartDataMap[i.id];
                if (!data || data.length < 2) return false;
                return data[data.length - 1].value < data[0].value;
              }).length : "—"}
            </div>
            <div className="text-sm text-destructive/70 mt-1">Fallend</div>
          </div>
        </div>
        
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="text-3xl font-bold font-mono text-primary">
              {hasData ? `$${Object.values(chartDataMap).reduce((sum, data) => {
                if (data && data.length > 0) {
                  return sum + data[data.length - 1].value;
                }
                return sum;
              }, 0).toLocaleString()}` : "—"}
            </div>
            <div className="text-sm text-primary/70 mt-1">Gesamtwert</div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {!hasData && (
        <div className="bg-muted/30 border border-border/50 rounded-lg p-4 text-center">
          <p className="text-muted-foreground">
            Klicke auf <span className="text-primary font-medium">"Alle laden"</span> um die Preisdaten für alle Indizes zu laden.
          </p>
        </div>
      )}

      {/* Index List */}
      <div className="space-y-3">
        {indices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Keine Indizes vorhanden. Erstelle deinen ersten Index!
          </div>
        ) : (
          indices.map((index) => (
            <IndexOverviewCard
              key={index.id}
              index={index}
              chartData={chartDataMap[index.id] || null}
              isLoading={loadingIndices.has(index.id)}
              onClick={() => setChartModalIndex(index)}
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
        />
      )}
    </div>
  );
}
