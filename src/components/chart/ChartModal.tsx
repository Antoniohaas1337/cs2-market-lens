import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PriceChart } from "./PriceChart";
import { ChartData, TimeRange } from "@/types";
import { getMockChartData } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indexId: number;
  indexName: string;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
  { value: "90", label: "90 Days" },
  { value: "180", label: "180 Days" },
  { value: "365", label: "1 Year" },
];

export function ChartModal({ open, onOpenChange, indexId, indexName }: ChartModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && indexId) {
      loadChartData();
    }
  }, [open, indexId, timeRange]);

  const loadChartData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    const data = getMockChartData(indexId, parseInt(timeRange));
    setChartData(data);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{indexName}</DialogTitle>
        </DialogHeader>

        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              variant={timeRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.value)}
              className={cn(
                "transition-all",
                timeRange === range.value && "shadow-glow"
              )}
            >
              {range.label}
            </Button>
          ))}
        </div>

        {/* Chart Content */}
        <div className="min-h-[400px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          ) : chartData ? (
            <PriceChart data={chartData} />
          ) : (
            <p className="text-muted-foreground">No data available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
