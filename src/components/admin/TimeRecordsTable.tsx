
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
        const duration = record.clock_out
          ? ((new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60)).toFixed(2)
          : "En curso";

        return {
          "Fecha de Entrada": new Date(record.clock_in).toLocaleString(),
          "Fecha de Salida": record.clock_out ? new Date(record.clock_out).toLocaleString() : "En curso",
          "Duración (horas)": duration,
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
            {timeRecords?.map((record) => {
              const duration = record.clock_out
                ? ((new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60)).toFixed(2)
                : "En curso";

              return (
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
                    {duration} {duration !== "En curso" ? "horas" : ""}
                  </TableCell>
                  <TableCell>{record.notes || "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TimeRecordsTable;
