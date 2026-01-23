import { CheckCircle2, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketIndex } from "@/types";
import { Progress } from "@/components/ui/progress";

export interface IndexItemProgress {
  completed: number;
  total: number;
}

interface LoadingProgressProps {
  indices: MarketIndex[];
  loadingIndices: Set<number>;
  completedIndices: Set<number>;
  completedCount: number;
  totalCount: number;
  itemProgress?: Record<number, IndexItemProgress>;
}

export function LoadingProgress({
  indices,
  loadingIndices,
  completedIndices,
  completedCount,
  totalCount,
  itemProgress = {},
}: LoadingProgressProps) {
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading Robust Sales History
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount} / {totalCount} indices complete
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground">Progress</div>
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
                  {index.item_count} Items • {index.selected_markets.length} Markets
                </div>
              </div>

              {/* Status Text / Progress */}
              <div className="flex-shrink-0 text-xs font-medium min-w-[80px] text-right">
                {isCompleted ? (
                  <span className="text-success">Done</span>
                ) : isLoading ? (
                  itemProgress[index.id] ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-primary">
                        {itemProgress[index.id].completed}/{itemProgress[index.id].total} Items
                      </span>
                      <Progress
                        value={(itemProgress[index.id].completed / itemProgress[index.id].total) * 100}
                        className="h-1.5 w-20"
                      />
                    </div>
                  ) : (
                    <span className="text-primary">Loading...</span>
                  )
                ) : (
                  <span className="text-muted-foreground">Waiting</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
        Uses carry-forward, outlier removal and volume weighting
      </div>
    </div>
  );
}
