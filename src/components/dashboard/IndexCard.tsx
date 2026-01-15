import { useState } from "react";
import { Calculator, LineChart, Pencil, Trash2, Loader2 } from "lucide-react";
import { MarketIndex } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IndexCardProps {
  index: MarketIndex;
  onCalculate: (id: number) => Promise<void>;
  onViewChart: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function IndexCard({
  index,
  onCalculate,
  onViewChart,
  onEdit,
  onDelete,
}: IndexCardProps) {
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      await onCalculate(index.id);
    } finally {
      setIsCalculating(false);
    }
  };

  const displayedMarkets = index.selected_markets.slice(0, 3);
  const remainingMarkets = index.selected_markets.length - 3;

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-glow animate-fade-in">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground truncate">
              {index.name}
            </CardTitle>
            {index.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {index.description}
              </p>
            )}
          </div>
          <Badge variant={index.type === "CUSTOM" ? "custom" : "prebuilt"}>
            {index.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Items</p>
            <p className="text-xl font-semibold font-mono">{index.item_count}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Latest Price</p>
            <p
              className={cn(
                "text-xl font-semibold font-mono",
                index.latest_price !== null ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {index.latest_price !== null
                ? `$${index.latest_price.toLocaleString()}`
                : "—"}
            </p>
          </div>
        </div>

        {/* Markets */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Markets</p>
          <div className="flex flex-wrap gap-1.5">
            {displayedMarkets.map((market) => (
              <Badge key={market} variant="market">
                {market}
              </Badge>
            ))}
            {remainingMarkets > 0 && (
              <Badge variant="market">+{remainingMarkets} more</Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex-1"
          >
            {isCalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Calculator className="h-4 w-4" />
            )}
            Calculate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewChart(index.id)}
            className="flex-1"
          >
            <LineChart className="h-4 w-4" />
            Chart
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(index.id)}
            className="shrink-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index.id)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
