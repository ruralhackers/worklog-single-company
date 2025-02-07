
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
  const { data: profile, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          username,
          user_roles!inner (role)
        `)
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
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

  // Show error message if profile not found
  if (profileError || !profile) {
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
              Usuario no encontrado o sin permisos necesarios
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <UserDetailsHeader 
        username={profile.username} 
        onBack={() => navigate("/admin/dashboard")} 
      />

      <div className="grid gap-6 md:grid-cols-2">
        <UserProfileCard 
          profile={profile} 
          userId={userId!} 
          onProfileUpdate={refetchProfile}
        />
        {monthlyHours && <MonthlyHoursCard monthlyHours={monthlyHours} />}
      </div>

      {timeRecords && <TimeRecordsTable timeRecords={timeRecords} />}
    </div>
  );
};

export default UserDetails;

