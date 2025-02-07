
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CustomRecordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customDate: string;
  customTime: string;
  customNotes: string;
  isLoading: boolean;
  recordType: "in" | "out";
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onCustomDialogOpen: (type: "in" | "out") => void;
}

export const CustomRecordDialog = ({
  isOpen,
  onOpenChange,
  customDate,
  customTime,
  customNotes,
  isLoading,
  recordType,
  onDateChange,
  onTimeChange,
  onNotesChange,
  onSubmit,
  onCustomDialogOpen,
}: CustomRecordDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onCustomDialogOpen(recordType)}
        >
          Registro Personalizado
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {recordType === "in" 
              ? "Registro de Entrada Personalizado"
              : "Registro de Salida Personalizado"
            }
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={customDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora</Label>
            <Input
              id="time"
              type="time"
              value={customTime}
              onChange={(e) => onTimeChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Añade notas o comentarios..."
              value={customNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button 
            className="w-full"
            onClick={onSubmit}
            disabled={isLoading || !customDate || !customTime}
          >
            Guardar Registro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
