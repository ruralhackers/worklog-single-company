
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

interface TimeRecord {
  id: string;
  clock_in: string;
  clock_out: string | null;
  notes: string | null;
}

interface UserRole {
  role: 'admin' | 'user';
}

interface UserProfile {
  username: string | null;
  user_roles: UserRole[];
}

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Verify admin status
  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin");
        return false;
      }
      const { data: isAdmin } = await supabase.rpc("is_admin", {
        user_uid: user.id,
      });
      if (!isAdmin) {
        navigate("/admin");
        return false;
      }
      return true;
    },
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          username,
          user_roles!inner (role)
        `)
        .eq("id", userId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: UserProfile = {
        username: data.username,
        user_roles: Array.isArray(data.user_roles) ? data.user_roles : [data.user_roles]
      };
      
      return transformedData;
    },
    enabled: !!isAdmin && !!userId,
  });

  // Fetch time records
  const { data: timeRecords } = useQuery({
    queryKey: ["timeRecords", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_records")
        .select("*")
        .eq("user_id", userId)
        .order("clock_in", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TimeRecord[];
    },
    enabled: !!isAdmin && !!userId,
  });

  // Calculate monthly hours
  const monthlyHours = timeRecords?.reduce((acc, record) => {
    const month = new Date(record.clock_in).toLocaleString('default', { month: 'long', year: 'numeric' });
    const hours = record.clock_out 
      ? (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60)
      : 0;
    
    acc[month] = (acc[month] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          Detalles del Usuario: {profile?.username || "Sin nombre de usuario"}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nombre de usuario</dt>
                <dd>{profile?.username || "Sin nombre de usuario"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd>{profile?.user_roles?.[0]?.role || "usuario"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horas Trabajadas por Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {monthlyHours && Object.entries(monthlyHours)
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
      </div>

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
    </div>
  );
};

export default UserDetails;
