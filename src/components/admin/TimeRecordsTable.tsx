
import { useState } from "react";
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
import { Pencil, Trash2 } from "lucide-react";
import { TimeRecord } from "@/pages/admin/UserDetails";
import EditTimeRecordDialog from "./time-records/EditTimeRecordDialog";
import DeleteTimeRecordDialog from "./time-records/DeleteTimeRecordDialog";
import { calculateDuration } from "./time-records/utils";

interface TimeRecordsTableProps {
  timeRecords: TimeRecord[];
  username?: string | null;
  onRecordsChange?: () => void;
}

const TimeRecordsTable = ({ timeRecords, onRecordsChange }: TimeRecordsTableProps) => {
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<TimeRecord | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteComplete = () => {
    setIsDeleteDialogOpen(false);
    setRecordToDelete(null);
    onRecordsChange?.();
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
                      onClick={() => setEditingRecord(record)}
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

        <EditTimeRecordDialog
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSave={() => {
            setEditingRecord(null);
            onRecordsChange?.();
          }}
        />

        <DeleteTimeRecordDialog
          record={recordToDelete}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={handleDeleteComplete}
        />
      </CardContent>
    </Card>
  );
};

export default TimeRecordsTable;
