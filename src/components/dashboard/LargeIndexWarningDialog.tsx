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
            <AlertDialogTitle className="text-xl">Warning: High Data Usage</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <p>
              The index <span className="font-semibold text-foreground">{indexName}</span> contains{" "}
              <span className="font-semibold text-foreground">{itemCount} items</span>.
            </p>
            <p>
              This index is very data-intensive and requires many API requests when loading.
              This can significantly reduce your available quota.
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
            Don't show this warning again
          </label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-warning hover:bg-warning/90">
            Enable anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
