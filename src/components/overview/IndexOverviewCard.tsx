import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MiniChart } from "./MiniChart";
import { MarketIndex, PricePoint } from "@/types";
import { cn } from "@/lib/utils";

interface IndexOverviewCardProps {
  index: MarketIndex;
  chartData: PricePoint[] | null;
  isLoading: boolean;
  onClick: () => void;
}

export function IndexOverviewCard({ index, chartData, isLoading, onClick }: IndexOverviewCardProps) {
  const priceChange = chartData && chartData.length >= 2
    ? chartData[chartData.length - 1].value - chartData[0].value
    : 0;
  
  const percentChange = chartData && chartData.length >= 2 && chartData[0].value > 0
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
    : 0;

  const isPositive = priceChange > 0;
  const isNeutral = priceChange === 0;

  const currentPrice = chartData && chartData.length > 0
    ? chartData[chartData.length - 1].value
    : index.latest_price;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/50 hover:bg-card/80 transition-all duration-300 cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Name and info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{index.name}</h3>
              <Badge variant={index.type === "PREBUILT" ? "prebuilt" : "custom"} className="text-xs">
                {index.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {index.item_count} Items • {index.selected_markets.length} Markets
            </p>
          </div>

          {/* Mini Chart */}
          <div className="flex-shrink-0">
            {isLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : chartData && chartData.length > 0 ? (
              <MiniChart data={chartData} isPositive={isPositive} />
            ) : (
              <div className="h-12 w-24 flex items-center justify-center text-xs text-muted-foreground">
                No data
              </div>
            )}
          </div>

          {/* Price and change */}
          <div className="flex-shrink-0 text-right min-w-[120px]">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-20 mb-1 ml-auto" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </>
            ) : (
              <>
                <div className="font-mono font-semibold text-lg text-foreground">
                  {currentPrice ? `$${currentPrice.toLocaleString()}` : "—"}
                </div>
                {chartData && chartData.length >= 2 && (
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-sm",
                    isPositive ? "text-success" : isNeutral ? "text-muted-foreground" : "text-destructive"
                  )}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : isNeutral ? (
                      <Minus className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Arrow indicator */}
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </div>
    </Card>
  );
}
