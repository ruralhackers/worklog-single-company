
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { TimeRecord } from "@/pages/admin/UserDetails";

interface MonthlyHoursCardProps {
  monthlyHours: Record<string, number>;
  timeRecords: TimeRecord[];
  username?: string | null;
}

const MonthlyHoursCard = ({ monthlyHours, timeRecords, username }: MonthlyHoursCardProps) => {
  const { toast } = useToast();

  const handleExportMonth = (month: string) => {
    try {
      // Convertir el mes a Date para comparar
      const [monthName, year] = month.split(' ');
      const monthDate = new Date(`${monthName} 1, ${year}`);
      
      // Filtrar registros del mes seleccionado
      const monthRecords = timeRecords.filter(record => {
        const recordDate = new Date(record.clock_in);
        return recordDate.getMonth() === monthDate.getMonth() && 
               recordDate.getFullYear() === monthDate.getFullYear();
      });

      // Preparar datos para exportar
      const data = monthRecords.map((record) => {
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
      const fileName = `registros_${username || 'usuario'}_${month.replace(' ', '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "¡Exportación exitosa!",
        description: `Los registros de ${month} se han exportado correctamente.`,
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
      <CardHeader>
        <CardTitle>Horas Trabajadas por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(monthlyHours).length > 0 ? (
          <dl className="space-y-4">
            {Object.entries(monthlyHours)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([month, hours]) => (
                <div key={month} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <dt className="text-sm font-medium text-gray-500">{month}</dt>
                    <dd>{hours.toFixed(2)} horas</dd>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportMonth(month)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              ))}
          </dl>
        ) : (
          <p className="text-center text-gray-500">No hay registros de horas</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyHoursCard;
