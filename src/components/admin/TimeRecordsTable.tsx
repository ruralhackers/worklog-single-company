import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Pencil, Trash2, X } from "lucide-react";
import { TimeRecord } from "@/pages/admin/UserDetails";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimeRecordsTableProps {
  timeRecords: TimeRecord[];
  username?: string | null;
  onRecordsChange?: () => void;
}

const TimeRecordsTable = ({ timeRecords, username, onRecordsChange }: TimeRecordsTableProps) => {
  const { toast } = useToast();
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editOutDate, setEditOutDate] = useState("");
  const [editOutTime, setEditOutTime] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<TimeRecord | null>(null);

  const handleExportToExcel = () => {
    try {
      const data = timeRecords.map((record) => {
        const clockIn = new Date(record.clock_in);
        const clockOut = record.clock_out ? new Date(record.clock_out) : null;
        
        let duration = "En curso";
        if (clockOut && clockOut > clockIn) {
          const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
          duration = `${hours.toFixed(2)} horas`;
        }

        return {
          "Fecha de Entrada": clockIn.toLocaleString(),
          "Fecha de Salida": clockOut ? clockOut.toLocaleString() : "En curso",
          "Duración": duration,
          "Notas": record.notes || "-"
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registros");
      const fileName = `registros_${username || 'usuario'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "¡Exportación exitosa!",
        description: "Los registros se han exportado correctamente.",
      });
    } catch (error) {
      console.error("Error al exportar:", error);
      toast({
        title: "Error al exportar",
        description: "No se pudieron exportar los registros.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: TimeRecord) => {
    const clockIn = new Date(record.clock_in);
    setEditDate(format(clockIn, "yyyy-MM-dd"));
    setEditTime(format(clockIn, "HH:mm"));
    
    if (record.clock_out) {
      const clockOut = new Date(record.clock_out);
      setEditOutDate(format(clockOut, "yyyy-MM-dd"));
      setEditOutTime(format(clockOut, "HH:mm"));
    } else {
      setEditOutDate("");
      setEditOutTime("");
    }
    
    setEditingRecord(record);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

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
        .eq('id', editingRecord.id);

      if (error) throw error;

      toast({
        title: "¡Actualización exitosa!",
        description: "El registro se ha actualizado correctamente.",
      });

      setEditingRecord(null);
      onRecordsChange?.();
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el registro.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    try {
      const { error } = await supabase
        .from('time_records')
        .delete()
        .eq('id', recordToDelete.id);

      if (error) throw error;

      toast({
        title: "¡Eliminación exitosa!",
        description: "El registro se ha eliminado correctamente.",
      });

      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
      onRecordsChange?.();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el registro.",
        variant: "destructive",
      });
    }
  };

  const calculateDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "En curso";
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    
    if (end <= start) return "Error en fechas";
    
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(2)} horas`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Últimos Registros</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeRecords?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {new Date(record.clock_in).toLocaleString()}
                </TableCell>
                <TableCell>
                  {record.clock_out
                    ? new Date(record.clock_out).toLocaleString()
                    : "En curso"}
                </TableCell>
                <TableCell>
                  {calculateDuration(record.clock_in, record.clock_out)}
                </TableCell>
                <TableCell>{record.notes || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRecordToDelete(record);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {timeRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500">
                  No hay registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Dialog de edición */}
        <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
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
              <Button onClick={handleSaveEdit}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar eliminación</DialogTitle>
            </DialogHeader>
            <p>¿Estás seguro de que deseas eliminar este registro?</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
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
      </CardContent>
    </Card>
  );
};

export default TimeRecordsTable;
