import { Check } from "lucide-react";
import { Market } from "@/types";
import { cn } from "@/lib/utils";

interface MarketSelectorProps {
  markets: Market[];
  selectedMarkets: string[];
  onToggle: (marketId: string) => void;
}

export function MarketSelector({ markets, selectedMarkets, onToggle }: MarketSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {markets.map((market) => {
        const isSelected = selectedMarkets.includes(market.id);
        return (
          <button
            key={market.id}
            type="button"
            onClick={() => onToggle(market.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
            )}
          >
            <span className="text-sm font-medium">{market.displayName}</span>
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              )}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
