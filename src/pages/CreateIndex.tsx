import { IndexForm } from "@/components/index-form/IndexForm";
import { useIndices } from "@/hooks/useIndices";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function CreateIndex() {
  const { createIndex } = useIndices();
  const { setEnabledIndices } = useDashboard();
  const navigate = useNavigate();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    selectedMarkets: string[];
    selectedItems: any[];
  }) => {
    const newIndex = await createIndex(data);

    // Enable the newly created index so it loads automatically
    if (newIndex?.id) {
      setEnabledIndices((prev) => {
        const next = new Set(prev);
        next.add(newIndex.id);
        return next;
      });
    }

    toast.success("Index created successfully!");
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create New Index</h1>
        <p className="text-muted-foreground">
          Build a custom market index to track CS2 item prices
        </p>
      </div>

      <IndexForm onSubmit={handleSubmit} />
    </div>
  );
}
