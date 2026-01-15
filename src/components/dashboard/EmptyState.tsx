import { TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <TrendingUp className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-secondary border border-border">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No indices yet
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Create your first market index to start tracking CS2 item prices across multiple markets.
      </p>
      
      <Button variant="glow" size="lg" onClick={() => navigate("/create")}>
        <Plus className="h-5 w-5" />
        Create Your First Index
      </Button>
    </div>
  );
}
