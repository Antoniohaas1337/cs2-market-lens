import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, Loader2, Check, X, Filter, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Item } from "@/types";
import * as api from "@/api/client";
import { cn } from "@/lib/utils";

// Component to display selected items with collapsible list
interface SelectedItemsListProps {
  items: Item[];
  onRemoveItem: (id: number) => void;
  onClearAll: () => void;
}

function SelectedItemsList({ items, onRemoveItem, onClearAll }: SelectedItemsListProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_TO_SHOW = 20;

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter((item) =>
      item.market_hash_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const displayedItems = expanded ? filteredItems : filteredItems.slice(0, ITEMS_TO_SHOW);
  const hasMore = filteredItems.length > ITEMS_TO_SHOW;

  return (
    <div className="border border-success/20 rounded-lg overflow-hidden bg-success/5">
      {/* Header */}
      <div className="p-3 border-b border-success/20 flex items-center gap-3">
        <Check className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success flex-1">
          {items.length.toLocaleString()} items selected
        </span>
        {items.length > ITEMS_TO_SHOW && (
          <div className="relative max-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-7 pl-7 text-xs"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-destructive hover:text-destructive"
          onClick={onClearAll}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Remove all
        </Button>
      </div>

      {/* Items List */}
      <ScrollArea className={expanded && filteredItems.length > 10 ? "h-[300px]" : undefined}>
        <div className="divide-y divide-border/50">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 group"
            >
              <span className="flex-1 text-sm truncate">{item.market_hash_name}</span>
              <span className="text-xs text-muted-foreground">{item.type}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                onClick={() => onRemoveItem(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Show More Button */}
      {hasMore && (
        <div className="p-2 border-t border-success/20">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show {filteredItems.length - ITEMS_TO_SHOW} more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface RuleBasedItemSelectorProps {
  selectedItems: Item[];
  onItemsChange: (items: Item[]) => void;
}

interface FilterState {
  types: string[];
  weapons: string[];
  exteriors: string[];
  qualities: string[];
}

interface FacetSectionProps {
  title: string;
  values: api.AggregationValue[];
  selected: string[];
  onToggle: (value: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  maxVisible?: number;
  searchable?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

function FacetSection({
  title,
  values,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  maxVisible = 6,
  searchable = false,
  expanded: controlledExpanded,
  onExpandedChange,
}: FacetSectionProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use controlled expanded state if provided, otherwise use local state
  const expanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  const setExpanded = (value: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(value);
    } else {
      setLocalExpanded(value);
    }
  };

  const filteredValues = useMemo(() => {
    if (!searchQuery) return values;
    return values.filter((v) =>
      v.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [values, searchQuery]);

  const displayedValues = expanded ? filteredValues : filteredValues.slice(0, maxVisible);
  const hasMore = filteredValues.length > maxVisible;
  const allSelected = values.length > 0 && values.every((v) => selected.includes(v.value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selected.length}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={allSelected ? onClearAll : onSelectAll}
          >
            {allSelected ? "None" : "All"}
          </Button>
        </div>
      </div>

      {searchable && values.length > maxVisible && (
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${title}...`}
            className="h-7 pl-7 text-xs"
          />
        </div>
      )}

      <div className="space-y-1">
        {displayedValues.map((item) => (
          <label
            key={item.value}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
              selected.includes(item.value)
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50"
            )}
          >
            <Checkbox
              checked={selected.includes(item.value)}
              onCheckedChange={() => onToggle(item.value)}
              className="h-3.5 w-3.5"
            />
            <span className="flex-1 text-sm truncate">{item.value}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {item.count.toLocaleString()}
            </span>
          </label>
        ))}
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show {filteredValues.length - maxVisible} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}

export function RuleBasedItemSelector({
  selectedItems,
  onItemsChange,
}: RuleBasedItemSelectorProps) {
  console.log("[RuleBasedItemSelector] Rendering...");

  const [aggregations, setAggregations] = useState<api.ItemAggregationsResponse | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    weapons: [],
    exteriors: [],
    qualities: [],
  });
  const [filteredItems, setFilteredItems] = useState<api.ItemResponse[]>([]);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [isLoadingAggregations, setIsLoadingAggregations] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPage, setPreviewPage] = useState(1);
  const [previewSearch, setPreviewSearch] = useState("");

  // Track expanded state for each filter section
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    types: false,
    weapons: false,
    exteriors: false,
    qualities: false,
  });

  // Load aggregations only once on mount
  useEffect(() => {
    console.log("[RuleBasedItemSelector] Loading initial aggregations...");
    const loadAggregations = async () => {
      setIsLoadingAggregations(true);
      try {
        // Load all items without filters to get full aggregation data
        const data = await api.getItemAggregations({});
        console.log("[RuleBasedItemSelector] Aggregations loaded:", data);
        setAggregations(data);
        setMatchCount(data.total_items);
      } catch (error) {
        console.error("[RuleBasedItemSelector] Failed to load aggregations:", error);
      } finally {
        setIsLoadingAggregations(false);
      }
    };

    loadAggregations();
  }, []); // Only run once on mount

  // Calculate match count based on current filters (client-side)
  useEffect(() => {
    if (!aggregations) return;

    // Simple count calculation based on filters
    // Note: This is an approximation. For exact counts, you'd need to sum filtered aggregations
    const hasFilters = filters.types.length > 0 || filters.weapons.length > 0 ||
                       filters.exteriors.length > 0 || filters.qualities.length > 0;

    if (!hasFilters) {
      setMatchCount(aggregations.total_items);
    }
    // For filtered counts, keep the previous matchCount or estimate
    // The exact count will be updated when preview loads actual items
  }, [filters, aggregations]);

  // Load filtered items when showing preview
  const loadFilteredItems = useCallback(async (page: number = 1) => {
    if (!hasActiveFilters) return;

    setIsLoadingItems(true);
    try {
      const response = await api.filterItems(
        {
          types: filters.types.length > 0 ? filters.types : undefined,
          weapons: filters.weapons.length > 0 ? filters.weapons : undefined,
          exteriors: filters.exteriors.length > 0 ? filters.exteriors : undefined,
          qualities: filters.qualities.length > 0 ? filters.qualities : undefined,
          search: previewSearch || undefined,
        },
        page,
        50
      );
      setFilteredItems(response.items);
      setMatchCount(response.total);
    } catch (error) {
      console.error("Failed to load filtered items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  }, [filters, previewSearch]);

  useEffect(() => {
    if (showPreview) {
      loadFilteredItems(previewPage);
    }
  }, [showPreview, previewPage, loadFilteredItems]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.weapons.length > 0 ||
      filters.exteriors.length > 0 ||
      filters.qualities.length > 0
    );
  }, [filters]);

  const toggleFilter = useCallback((category: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
    setShowPreview(false);
    setPreviewPage(1);
  }, []);

  const selectAllInCategory = useCallback(
    (category: keyof FilterState) => {
      if (!aggregations) return;
      const values = aggregations[category].map((v) => v.value);
      setFilters((prev) => ({ ...prev, [category]: values }));
      setShowPreview(false);
    },
    [aggregations]
  );

  const clearCategory = useCallback((category: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [category]: [] }));
    setShowPreview(false);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({ types: [], weapons: [], exteriors: [], qualities: [] });
    setShowPreview(false);
    setFilteredItems([]);
  }, []);

  // Add all matching items (including keyword search)
  const addAllMatchingItems = useCallback(async () => {
    if (!hasActiveFilters && !previewSearch) return;

    setIsLoadingItems(true);
    try {
      // First, get the total count
      const countResponse = await api.filterItems(
        {
          types: filters.types.length > 0 ? filters.types : undefined,
          weapons: filters.weapons.length > 0 ? filters.weapons : undefined,
          exteriors: filters.exteriors.length > 0 ? filters.exteriors : undefined,
          qualities: filters.qualities.length > 0 ? filters.qualities : undefined,
          search: previewSearch || undefined, // Include keyword search!
        },
        1,
        1 // Just get count
      );

      const totalItems = countResponse.total;
      const batchSize = 5000;
      const allItems: Item[] = [];

      // Load items in batches
      for (let page = 1; page <= Math.ceil(totalItems / batchSize); page++) {
        const response = await api.filterItems(
          {
            types: filters.types.length > 0 ? filters.types : undefined,
            weapons: filters.weapons.length > 0 ? filters.weapons : undefined,
            exteriors: filters.exteriors.length > 0 ? filters.exteriors : undefined,
            qualities: filters.qualities.length > 0 ? filters.qualities : undefined,
            search: previewSearch || undefined, // Include keyword search!
          },
          page,
          batchSize
        );

        // Convert to Item type
        const batchItems: Item[] = response.items.map((item) => ({
          id: item.id,
          market_hash_name: item.market_hash_name,
          type: item.type || "Unknown",
        }));

        allItems.push(...batchItems);
      }

      // Filter out already selected items
      const existingIds = new Set(selectedItems.map((i) => i.id));
      const uniqueNewItems = allItems.filter((item) => !existingIds.has(item.id));

      onItemsChange([...selectedItems, ...uniqueNewItems]);
      clearAllFilters();
      setPreviewSearch(""); // Clear keyword search too
    } catch (error) {
      console.error("Failed to add items:", error);
    } finally {
      setIsLoadingItems(false);
    }
  }, [filters, hasActiveFilters, previewSearch, selectedItems, onItemsChange, clearAllFilters]);

  // Toggle single item in preview
  const toggleItem = useCallback(
    (item: api.ItemResponse) => {
      const exists = selectedItems.some((i) => i.id === item.id);
      if (exists) {
        onItemsChange(selectedItems.filter((i) => i.id !== item.id));
      } else {
        onItemsChange([
          ...selectedItems,
          {
            id: item.id,
            market_hash_name: item.market_hash_name,
            type: item.type || "Unknown",
          },
        ]);
      }
    },
    [selectedItems, onItemsChange]
  );

  // Filter out weapons that don't make sense for current type selection
  // IMPORTANT: This must be before any conditional returns to maintain hook order
  const relevantWeapons = useMemo(() => {
    // If specific types are selected, we might want to filter weapons
    // For now, show all weapons but this could be enhanced
    return aggregations?.weapons || [];
  }, [aggregations?.weapons]);

  if (isLoadingAggregations) {
    console.log("[RuleBasedItemSelector] Showing loading state");
    return (
      <div className="flex items-center justify-center py-12 bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading filters...</span>
      </div>
    );
  }

  if (!aggregations) {
    console.log("[RuleBasedItemSelector] Showing error state - no aggregations");
    return (
      <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-lg">
        Error loading filters
      </div>
    );
  }

  console.log("[RuleBasedItemSelector] Rendering main UI");

  return (
    <div className="space-y-4">
      {/* Tip Box - only show when no filters are active */}
      {!hasActiveFilters && selectedItems.length === 0 && (
        <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Select filters and use the preview search to narrow down items further.
          E.g. all "Rifle" skins with keyword "Redline" for all red AK/AWP Redline skins.
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {matchCount.toLocaleString()} items found
          </span>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearAllFilters}
          >
            <X className="h-3 w-3 mr-1" />
            Reset filters
          </Button>
        </div>
      )}

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Filter */}
        <div className="p-3 rounded-lg border border-border bg-card/50">
          <FacetSection
            title="Item Type"
            values={aggregations.types}
            selected={filters.types}
            onToggle={(v) => toggleFilter("types", v)}
            onSelectAll={() => selectAllInCategory("types")}
            onClearAll={() => clearCategory("types")}
            maxVisible={8}
            expanded={expandedSections.types}
            onExpandedChange={(exp) => setExpandedSections(prev => ({ ...prev, types: exp }))}
          />
        </div>

        {/* Exterior Filter */}
        <div className="p-3 rounded-lg border border-border bg-card/50">
          <FacetSection
            title="Exterior"
            values={aggregations.exteriors}
            selected={filters.exteriors}
            onToggle={(v) => toggleFilter("exteriors", v)}
            onSelectAll={() => selectAllInCategory("exteriors")}
            onClearAll={() => clearCategory("exteriors")}
            maxVisible={6}
            expanded={expandedSections.exteriors}
            onExpandedChange={(exp) => setExpandedSections(prev => ({ ...prev, exteriors: exp }))}
          />
        </div>

        {/* Weapon Filter */}
        <div className="p-3 rounded-lg border border-border bg-card/50">
          <FacetSection
            title="Weapon"
            values={relevantWeapons}
            selected={filters.weapons}
            onToggle={(v) => toggleFilter("weapons", v)}
            onSelectAll={() => selectAllInCategory("weapons")}
            onClearAll={() => clearCategory("weapons")}
            maxVisible={6}
            searchable
            expanded={expandedSections.weapons}
            onExpandedChange={(exp) => setExpandedSections(prev => ({ ...prev, weapons: exp }))}
          />
        </div>

        {/* Quality Filter */}
        <div className="p-3 rounded-lg border border-border bg-card/50">
          <FacetSection
            title="Quality"
            values={aggregations.qualities}
            selected={filters.qualities}
            onToggle={(v) => toggleFilter("qualities", v)}
            onSelectAll={() => selectAllInCategory("qualities")}
            onClearAll={() => clearCategory("qualities")}
            maxVisible={6}
            expanded={expandedSections.qualities}
            onExpandedChange={(exp) => setExpandedSections(prev => ({ ...prev, qualities: exp }))}
          />
        </div>
      </div>

      {/* Actions */}
      {hasActiveFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Package className="h-4 w-4 mr-2" />
            {showPreview ? "Hide preview" : "Show preview"}
          </Button>
          <Button
            variant="glow"
            className="flex-1"
            onClick={addAllMatchingItems}
            disabled={isLoadingItems || matchCount === 0}
          >
            {isLoadingItems ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Add all {matchCount.toLocaleString()} items
          </Button>
        </div>
      )}

      {/* Preview */}
      {showPreview && hasActiveFilters && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-3 bg-muted/30 border-b border-border space-y-2">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium">Preview</h4>
              <div className="flex-1">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    value={previewSearch}
                    onChange={(e) => {
                      setPreviewSearch(e.target.value);
                      setPreviewPage(1);
                    }}
                    placeholder="Enter keyword to filter..."
                    className="h-7 pl-7 text-xs"
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {matchCount.toLocaleString()} Items
              </span>
            </div>

            {/* Keyword search hint and action */}
            {previewSearch && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md border border-primary/20">
                <Filter className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-xs text-primary flex-1">
                  <strong>Tip:</strong> With keyword "{previewSearch}" only {matchCount.toLocaleString()} matching items will be added
                </span>
                <Button
                  variant="default"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={addAllMatchingItems}
                  disabled={isLoadingItems}
                >
                  {isLoadingItems ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>Add these {matchCount.toLocaleString()}</>
                  )}
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="h-[300px]">
            {isLoadingItems ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredItems.map((item) => {
                  const isSelected = selectedItems.some((i) => i.id === item.id);
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                        isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleItem(item)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.market_hash_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[item.type, item.weapon, item.exterior]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      {/* Selected Items List with Show More */}
      {selectedItems.length > 0 && (
        <SelectedItemsList
          items={selectedItems}
          onRemoveItem={(id) => onItemsChange(selectedItems.filter((i) => i.id !== id))}
          onClearAll={() => onItemsChange([])}
        />
      )}
    </div>
  );
}
