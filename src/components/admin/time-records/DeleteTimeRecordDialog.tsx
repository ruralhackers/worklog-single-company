
import { TimeRecord } from "@/pages/admin/UserDetails";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteTimeRecordDialogProps {
  record: TimeRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteTimeRecordDialog = ({ record, isOpen, onClose, onDelete }: DeleteTimeRecordDialogProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!record) return;

    try {
      const { error } = await supabase
        .from('time_records')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: "¡Eliminación exitosa!",
        description: "El registro se ha eliminado correctamente.",
      });

      onDelete();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el registro.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar eliminación</DialogTitle>
        </DialogHeader>
        <p>¿Estás seguro de que deseas eliminar este registro?</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTimeRecordDialog;
