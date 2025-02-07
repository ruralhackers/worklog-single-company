
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MonthlyHoursCardProps {
  monthlyHours: Record<string, number>;
}

const MonthlyHoursCard = ({ monthlyHours }: MonthlyHoursCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horas Trabajadas por Mes</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          {Object.entries(monthlyHours)
            .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
            .map(([month, hours]) => (
              <div key={month} className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">{month}</dt>
                <dd>{hours.toFixed(2)} horas</dd>
              </div>
            ))}
        </dl>
      </CardContent>
    </Card>
  );
};

export default MonthlyHoursCard;
