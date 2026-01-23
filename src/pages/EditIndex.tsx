import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { IndexForm } from "@/components/index-form/IndexForm";
import { useIndices } from "@/hooks/useIndices";
import { useDashboard } from "@/contexts/DashboardContext";
import { MarketIndex } from "@/types";
import { toast } from "sonner";

export default function EditIndex() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getIndex, updateIndex } = useIndices();
  const { setEnabledIndices } = useDashboard();
  const [index, setIndex] = useState<MarketIndex | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIndex = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      const data = await getIndex(parseInt(id));
      if (data) {
        setIndex(data);
      } else {
        toast.error("Index not found");
        navigate("/");
      }
      setIsLoading(false);
    };

    loadIndex();
  }, [id]);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    selectedMarkets: string[];
    selectedItems: any[];
  }) => {
    if (!id) return;

    console.log('EditIndex handleSubmit called with:', data);

    try {
      const result = await updateIndex(parseInt(id), data);
      console.log('Update result:', result);

      // Enable the updated index so it loads automatically
      setEnabledIndices((prev) => {
        const next = new Set(prev);
        next.add(parseInt(id));
        return next;
      });

      // Success! Show toast and navigate
      toast.success("Index updated successfully!");

      // Use requestAnimationFrame to ensure toast is shown before navigation
      requestAnimationFrame(() => {
        setTimeout(() => {
          navigate("/");
        }, 300);
      });
    } catch (error) {
      console.error("Failed to update index - error details:", error);

      // Provide detailed error message
      if (error instanceof Error) {
        toast.error(`Failed to update index: ${error.message}`);
      } else {
        toast.error("Failed to update index. Please try again.");
      }

      // Re-throw to ensure form knows about the error
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading index...</p>
        </div>
      </div>
    );
  }

  if (!index) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Edit Index</h1>
        <p className="text-muted-foreground">
          Update your market index configuration
        </p>
      </div>

      <IndexForm initialData={index} isEditing onSubmit={handleSubmit} />
    </div>
  );
}
