
import { useState } from "react";
import { format } from "date-fns";
import { TimeRecord } from "@/pages/admin/UserDetails";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditTimeRecordDialogProps {
  record: TimeRecord | null;
  onClose: () => void;
  onSave: () => void;
}

const EditTimeRecordDialog = ({ record, onClose, onSave }: EditTimeRecordDialogProps) => {
  const { toast } = useToast();
  const [editDate, setEditDate] = useState(() => 
    record ? format(new Date(record.clock_in), "yyyy-MM-dd") : ""
  );
  const [editTime, setEditTime] = useState(() =>
    record ? format(new Date(record.clock_in), "HH:mm") : ""
  );
  const [editOutDate, setEditOutDate] = useState(() =>
    record?.clock_out ? format(new Date(record.clock_out), "yyyy-MM-dd") : ""
  );
  const [editOutTime, setEditOutTime] = useState(() =>
    record?.clock_out ? format(new Date(record.clock_out), "HH:mm") : ""
  );

  const handleSave = async () => {
    if (!record) return;

    const clockIn = new Date(`${editDate}T${editTime}`);
    let clockOut = null;
    if (editOutDate && editOutTime) {
      clockOut = new Date(`${editOutDate}T${editOutTime}`);
      if (clockOut <= clockIn) {
        toast({
          title: "Error",
          description: "La hora de salida debe ser posterior a la hora de entrada",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('time_records')
        .update({
          clock_in: clockIn.toISOString(),
          clock_out: clockOut?.toISOString() || null,
          is_manual: true
        })
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: "¡Actualización exitosa!",
        description: "El registro se ha actualizado correctamente.",
      });

      onSave();
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el registro.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!record} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Registro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Entrada</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              <Input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Salida</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={editOutDate}
                onChange={(e) => setEditOutDate(e.target.value)}
              />
              <Input
                type="time"
                value={editOutTime}
                onChange={(e) => setEditOutTime(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTimeRecordDialog;
