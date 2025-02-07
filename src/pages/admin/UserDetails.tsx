
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
      // First get the profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Then get the roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (rolesError) throw rolesError;

      return {
        username: profileData?.username,
        user_roles: rolesData || []
      } as UserProfile;
    },
    enabled: !!isAdmin && !!userId,
  });

  // Fetch time records
  const { data: timeRecords, isLoading: isTimeRecordsLoading } = useQuery({
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

  // Show loading state while checking admin status or loading profile
  if (isAdminLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Show error message if there was an error fetching the profile
  if (profileError) {
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
              Error al cargar el perfil del usuario
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the user profile
  return (
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
        {monthlyHours && <MonthlyHoursCard monthlyHours={monthlyHours} />}
      </div>

      {timeRecords && <TimeRecordsTable timeRecords={timeRecords} />}
    </div>
  );
};

export default UserDetails;
