import { IndexForm } from "@/components/index-form/IndexForm";
import { useCreateIndexMutation } from "@/hooks/queries";
import { useDashboard } from "@/contexts/DashboardContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Item } from "@/types";

export default function CreateIndex() {
  const createIndexMutation = useCreateIndexMutation();
  const { setEnabledIndices } = useDashboard();
  const navigate = useNavigate();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    selectedMarkets: string[];
    selectedItems: Item[];
  }) => {
    const newIndex = await createIndexMutation.mutateAsync(data);

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
