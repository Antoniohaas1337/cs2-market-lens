import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketIndex } from "@/types";

interface LoadingProgressProps {
  indices: MarketIndex[];
  loadingIndices: Set<number>;
  completedIndices: Set<number>;
  completedCount: number;
  totalCount: number;
}

export function LoadingProgress({
  indices,
  loadingIndices,
  completedIndices,
  completedCount,
  totalCount,
}: LoadingProgressProps) {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Lade robuste Sales-Historie
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} / {totalCount} Indizes fertig
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Fortschritt</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Individual Index Progress */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {indices.map((index) => {
          const isLoading = loadingIndices.has(index.id);
          const isCompleted = completedIndices.has(index.id);
          const isPending = !isLoading && !isCompleted;

          return (
            <div
              key={index.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                isCompleted && "bg-success/5 border-success/20",
                isLoading && "bg-primary/5 border-primary/20 animate-pulse",
                isPending && "bg-muted/20 border-border/50"
              )}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50" />
                )}
              </div>

              {/* Index Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{index.name}</div>
                <div className="text-xs text-muted-foreground">
                  {index.item_count} Items • {index.selected_markets.length} Märkte
                </div>
              </div>

              {/* Status Text */}
              <div className="flex-shrink-0 text-xs font-medium">
                {isCompleted ? (
                  <span className="text-success">Fertig</span>
                ) : isLoading ? (
                  <span className="text-primary">Lädt...</span>
                ) : (
                  <span className="text-muted-foreground">Wartet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
        Verwendet Carry-Forward, Outlier-Removal und Volume-Weighting
      </div>
    </div>
  );
}
