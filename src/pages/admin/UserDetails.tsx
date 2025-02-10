
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserProfileCard from "@/components/admin/UserProfileCard";
import MonthlyHoursCard from "@/components/admin/MonthlyHoursCard";
import TimeRecordsTable from "@/components/admin/TimeRecordsTable";
import UserDetailsHeader from "@/components/admin/UserDetailsHeader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useToast } from "@/hooks/use-toast";

export interface TimeRecord {
  id: string;
  clock_in: string;
  clock_out: string | null;
  notes: string | null;
}

interface UserRole {
  role: 'admin' | 'user';
}

export interface UserProfile {
  username: string | null;
  user_roles: UserRole[];
}

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verify admin status
  const { data: isAdmin, isLoading: isAdminLoading } = useQuery({
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

  // Fetch user profile with a left join
  const { data: profile, error: profileError, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      console.log("Fetching profile for user:", userId);
      // First get the profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      // Then get the roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        throw rolesError;
      }

      return {
        username: profileData?.username,
        user_roles: rolesData || []
      } as UserProfile;
    },
    enabled: !!isAdmin && !!userId,
  });

  // Fetch current user for the header
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  // Fetch time records with error handling
  const { data: timeRecords, isLoading: isTimeRecordsLoading, error: timeRecordsError } = useQuery({
    queryKey: ["timeRecords", userId],
    queryFn: async () => {
      console.log("Fetching time records for user:", userId);
      if (!userId) throw new Error("No user ID provided");

      const { data, error } = await supabase
        .from("time_records")
        .select("*")
        .eq("user_id", userId)
        .order("clock_in", { ascending: false });

      if (error) {
        console.error("Error fetching time records:", error);
        toast({
          title: "Error al cargar registros",
          description: "No se pudieron cargar los registros de tiempo.",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Time records fetched:", data);
      return data as TimeRecord[];
    },
    enabled: !!isAdmin && !!userId,
  });

  // Calculate monthly hours
  const monthlyHours = timeRecords?.reduce((acc, record) => {
    if (!record.clock_in || !record.clock_out) return acc;
    
    const month = new Date(record.clock_in).toLocaleString('default', { month: 'long', year: 'numeric' });
    const hours = (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60);
    
    acc[month] = (acc[month] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  // Show loading state while checking admin status or loading profile
  if (isAdminLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Show error message if there was an error fetching the profile
  if (profileError || timeRecordsError) {
    return (
      <div className="container mx-auto py-10 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error al cargar los datos del usuario
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the user profile
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userId={currentUser?.id || null} onLogout={handleLogout} />
      
      <div className="container mx-auto py-10 space-y-6">
        <UserDetailsHeader 
          username={profile?.username || "Sin nombre de usuario"} 
          onBack={() => navigate("/admin/dashboard")} 
        />

        <div className="grid gap-6 md:grid-cols-2">
          {profile && (
            <UserProfileCard 
              profile={profile} 
              userId={userId!} 
              onProfileUpdate={refetchProfile}
            />
          )}
          {monthlyHours && Object.keys(monthlyHours).length > 0 && (
            <MonthlyHoursCard monthlyHours={monthlyHours} />
          )}
        </div>

        {timeRecords && timeRecords.length > 0 ? (
          <TimeRecordsTable 
            timeRecords={timeRecords} 
            username={profile?.username}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                No hay registros de tiempo para este usuario
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
