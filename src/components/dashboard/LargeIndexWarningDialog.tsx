import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";

interface LargeIndexWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indexName: string;
  itemCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LargeIndexWarningDialog({
  open,
  onOpenChange,
  indexName,
  itemCount,
  onConfirm,
  onCancel,
}: LargeIndexWarningDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    if (dontShowAgain) {
      localStorage.setItem("hideLargeIndexWarning", "true");
    }
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-warning/10">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-xl">Achtung: Hoher Datenverbrauch</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              Der Index <span className="font-semibold text-foreground">{indexName}</span> enthält{" "}
              <span className="font-semibold text-foreground">{itemCount} Items</span>.
            </p>
            <p>
              Dieser Index ist sehr datenintensiv und verbraucht viele API-Anfragen beim Laden.
              Das kann Ihre verfügbare Quote deutlich reduzieren.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="dont-show"
            checked={dontShowAgain}
            onCheckedChange={(checked) => setDontShowAgain(checked === true)}
          />
          <label
            htmlFor="dont-show"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Diese Warnung nicht mehr anzeigen
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-warning hover:bg-warning/90">
            Trotzdem aktivieren
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
