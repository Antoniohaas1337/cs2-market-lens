import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/types";
import * as api from "@/api/client";

interface ItemSearchProps {
  selectedItems: Item[];
  onAddItem: (item: Item) => void;
  onRemoveItem: (itemId: number) => void;
}

export function ItemSearch({ selectedItems, onAddItem, onRemoveItem }: ItemSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setError(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await api.searchItems(value, 20);
        // Transform API response to frontend Item type
        const transformedItems: Item[] = response.items.map((item) => ({
          id: item.id,
          market_hash_name: item.market_hash_name,
          type: item.type || 'Unknown',
        }));
        // Filter out already selected items
        const filteredResults = transformedItems.filter(
          (item) => !selectedItems.some((selected) => selected.id === item.id)
        );
        setResults(filteredResults);
        setShowResults(true);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [selectedItems]);

  const handleSelectItem = (item: Item) => {
    onAddItem(item);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search items (min. 3 characters)..."
            className="pl-10 pr-10 bg-secondary/50 border-border focus:border-primary"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 max-h-64 overflow-auto rounded-lg border border-border bg-popover shadow-lg animate-scale-in">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.market_hash_name}
                  </p>
                </div>
                <Badge variant="market" className="ml-2 shrink-0">
                  {item.type}
                </Badge>
              </button>
            ))}
          </div>
        )}

        {showResults && query.length >= 3 && results.length === 0 && !isSearching && (
          <div className="absolute z-50 w-full mt-2 p-4 rounded-lg border border-border bg-popover shadow-lg">
            <p className="text-sm text-muted-foreground text-center">
              {error ? error : "No items found. Try refining your search."}
            </p>
          </div>
        )}
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selected items ({selectedItems.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm animate-scale-in"
              >
                <span className="text-foreground truncate max-w-[200px]">
                  {item.market_hash_name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
