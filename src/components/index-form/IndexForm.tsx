import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarketSelector } from "./MarketSelector";
import { ItemSearch } from "./ItemSearch";
import { Item, MarketIndex } from "@/types";
import { useMarkets } from "@/hooks/useMarkets";
import { cn } from "@/lib/utils";

interface IndexFormProps {
  initialData?: MarketIndex;
  isEditing?: boolean;
  onSubmit: (data: {
    name: string;
    description: string;
    selectedMarkets: string[];
    selectedItems: Item[];
  }) => Promise<void>;
}

const STEPS = [
  { id: 1, title: "Basic Info", description: "Name and description" },
  { id: 2, title: "Markets", description: "Select data sources" },
  { id: 3, title: "Items", description: "Add CS2 items" },
];

export function IndexForm({ initialData, isEditing = false, onSubmit }: IndexFormProps) {
  const navigate = useNavigate();
  const { markets, isLoading: marketsLoading } = useMarkets();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(
    initialData?.selected_markets || []
  );
  const [selectedItems, setSelectedItems] = useState<Item[]>(initialData?.items || []);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !name.trim()) {
      newErrors.name = "Index name is required";
    }

    if (step === 2 && selectedMarkets.length === 0) {
      newErrors.markets = "Please select at least one market";
    }

    if (step === 3 && selectedItems.length === 0) {
      newErrors.items = "Please add at least one item";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      console.log('IndexForm submitting with selectedItems:', selectedItems);
      await onSubmit({ name, description, selectedMarkets, selectedItems });
      console.log('IndexForm onSubmit completed successfully');

      // Success! Only navigate if creating (edit mode handles its own navigation)
      if (!isEditing) {
        navigate("/");
      }
      // Keep button disabled during edit mode navigation
    } catch (error) {
      console.error("IndexForm: Failed to save index:", error);
      setIsSubmitting(false); // Re-enable button on error
      // Re-throw the error so parent component can handle it
      throw error;
    }
    // Note: Don't use finally here - let edit mode parent handle timing
  };

  const toggleMarket = (marketId: string) => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((id) => id !== marketId)
        : [...prev, marketId]
    );
    setErrors((prev) => ({ ...prev, markets: "" }));
  };

  const addItem = (item: Item) => {
    setSelectedItems((prev) => [...prev, item]);
    setErrors((prev) => ({ ...prev, items: "" }));
  };

  const removeItem = (itemId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all",
                    currentStep === step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6 p-6 rounded-xl border border-border bg-card">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div className="space-y-2">
              <Label htmlFor="name">Index Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g., My AWP Collection"
                className={cn(
                  "bg-secondary/50 border-border",
                  errors.name && "border-destructive"
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your index..."
                className="bg-secondary/50 border-border resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Market Selection */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div className="space-y-2">
              <Label>Select Markets *</Label>
              <p className="text-sm text-muted-foreground">
                Choose which markets to use for price data ({selectedMarkets.length}{" "}
                selected)
              </p>
            </div>
            {marketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading markets...</span>
              </div>
            ) : (
              <MarketSelector
                markets={markets}
                selectedMarkets={selectedMarkets}
                onToggle={toggleMarket}
              />
            )}
            {errors.markets && (
              <p className="text-sm text-destructive">{errors.markets}</p>
            )}
          </div>
        )}

        {/* Step 3: Item Selection */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-slide-up">
            <div className="space-y-2">
              <Label>Add Items *</Label>
              <p className="text-sm text-muted-foreground">
                Search and add CS2 items to your index
              </p>
            </div>
            <ItemSearch
              selectedItems={selectedItems}
              onAddItem={addItem}
              onRemoveItem={removeItem}
            />
            {errors.items && (
              <p className="text-sm text-destructive">{errors.items}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? () => navigate("/") : handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="glow"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isEditing ? "Update Index" : "Create Index"}
          </Button>
        )}
      </div>
    </div>
  );
}
