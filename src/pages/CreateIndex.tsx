import { IndexForm } from "@/components/index-form/IndexForm";
import { useIndices } from "@/hooks/useIndices";
import { toast } from "sonner";

export default function CreateIndex() {
  const { createIndex } = useIndices();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    selectedMarkets: string[];
    selectedItems: any[];
  }) => {
    await createIndex(data);
    toast.success("Index created successfully!");
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
