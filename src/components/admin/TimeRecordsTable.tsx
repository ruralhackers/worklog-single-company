
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
import { Download } from "lucide-react";
import { TimeRecord } from "@/pages/admin/UserDetails";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

interface TimeRecordsTableProps {
  timeRecords: TimeRecord[];
  username?: string | null;
}

const TimeRecordsTable = ({ timeRecords, username }: TimeRecordsTableProps) => {
  const { toast } = useToast();

  const handleExportToExcel = () => {
    try {
      // Preparar los datos para la exportación
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

      // Crear el libro de trabajo y la hoja
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registros");

      // Generar el nombre del archivo
      const fileName = `registros_${username || 'usuario'}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Descargar el archivo
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportToExcel}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entrada</TableHead>
              <TableHead>Salida</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Notas</TableHead>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TimeRecordsTable;

