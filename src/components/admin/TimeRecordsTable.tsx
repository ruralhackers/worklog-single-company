
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TimeRecord } from "@/pages/admin/UserDetails";

interface TimeRecordsTableProps {
  timeRecords: TimeRecord[];
}

const TimeRecordsTable = ({ timeRecords }: TimeRecordsTableProps) => {
  return (
    <Card>
      <CardHeader>
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
