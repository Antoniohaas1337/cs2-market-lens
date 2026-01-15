import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IndexCard } from "@/components/dashboard/IndexCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DeleteConfirmDialog } from "@/components/dashboard/DeleteConfirmDialog";
import { ChartModal } from "@/components/chart/ChartModal";
import { useIndices } from "@/hooks/useIndices";
import { MarketIndex } from "@/types";

export default function ManageIndices() {
  const navigate = useNavigate();
  const { indices, isLoading, fetchIndices, calculatePrice, deleteIndex } = useIndices();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<MarketIndex | null>(null);
  
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartIndex, setChartIndex] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    fetchIndices();
  }, []);

  const handleCalculate = async (id: number) => {
    await calculatePrice(id);
  };

  const handleViewChart = (id: number) => {
    const index = indices.find((i) => i.id === id);
    if (index) {
      setChartIndex({ id: index.id, name: index.name });
      setChartModalOpen(true);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    const index = indices.find((i) => i.id === id);
    if (index) {
      setIndexToDelete(index);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (indexToDelete) {
      await deleteIndex(indexToDelete.id);
      setDeleteDialogOpen(false);
      setIndexToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading indices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-7 w-7 text-primary" />
            Indizes verwalten
          </h1>
          <p className="text-muted-foreground">
            Erstelle, bearbeite und lösche deine Markt-Indizes
          </p>
        </div>
        {indices.length > 0 && (
          <Button variant="glow" onClick={() => navigate("/create")}>
            <Plus className="h-4 w-4" />
            Neuer Index
          </Button>
        )}
      </div>

      {/* Content */}
      {indices.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indices.map((index) => (
            <IndexCard
              key={index.id}
              index={index}
              onCalculate={handleCalculate}
              onViewChart={handleViewChart}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        indexName={indexToDelete?.name || ""}
        onConfirm={confirmDelete}
      />

      {/* Chart Modal */}
      {chartIndex && (
        <ChartModal
          open={chartModalOpen}
          onOpenChange={setChartModalOpen}
          indexId={chartIndex.id}
          indexName={chartIndex.name}
        />
      )}
    </div>
  );
}
