
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, ExternalLink } from "lucide-react";
import CreateUserDialog from "@/components/admin/CreateUserDialog";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface UserRole {
  role: 'admin' | 'user';
}

interface TimeRecordCount {
  count: number;
}

interface Profile {
  id: string;
  username: string | null;
  updated_at: string | null;
  user_roles: UserRole[];
  time_records: TimeRecordCount[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Verify admin status on component mount
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin");
        return null;
      }
      const { data: isAdmin } = await supabase.rpc("is_admin", {
        user_uid: user.id,
      });
      if (!isAdmin) {
        navigate("/admin");
        return null;
      }
      return user;
    },
  });

  // Fetch users data with proper join syntax and count of time records
  const { data: users, isLoading } = useQuery<Profile[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          updated_at,
          user_roles (role),
          time_records (count)
        `);

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      return profiles;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userId={user.id} onLogout={handleLogout} />
      
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Crear nuevo usuario
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Registros de tiempo</TableHead>
                <TableHead>Última actualización</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.username || "Sin nombre de usuario"}
                  </TableCell>
                  <TableCell>
                    {user.user_roles?.[0]?.role || "usuario"}
                  </TableCell>
                  <TableCell>
                    {user.time_records?.[0]?.count || 0}
                  </TableCell>
                  <TableCell>
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleDateString()
                      : "No disponible"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link to={`/admin/dashboard/user/${user.id}`}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Ver detalles
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <CreateUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
