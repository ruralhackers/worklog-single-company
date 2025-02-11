
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import UserProfileCard from "@/components/admin/UserProfileCard";
import MonthlyHoursCard from "@/components/admin/MonthlyHoursCard";
import TimeRecordsTable from "@/components/admin/TimeRecordsTable";
import UserDetailsHeader from "@/components/admin/UserDetailsHeader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import ErrorCard from "@/components/admin/ErrorCard";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/admin/useAdminCheck";
import { useUserProfile } from "@/hooks/admin/useUserProfile";
import { useTimeRecords } from "@/hooks/admin/useTimeRecords";
import { useCurrentUser } from "@/hooks/admin/useCurrentUser";

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
  const { data: isAdmin, isLoading: isAdminLoading } = useAdminCheck();

  // Fetch user profile
  const { 
    data: profile, 
    error: profileError, 
    isLoading: isProfileLoading, 
    refetch: refetchProfile 
  } = useUserProfile(userId, isAdmin);

  // Fetch current user for the header
  const { data: currentUser } = useCurrentUser();

  // Fetch time records
  const { data: timeRecords, isLoading: isTimeRecordsLoading, refetch: refetchTimeRecords } = useTimeRecords(userId, isAdmin);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  // Calculate monthly hours
  const getMonthlyHours = () => {
    if (!timeRecords || timeRecords.length === 0) return {};
    
    return timeRecords.reduce((acc, record) => {
      if (!record.clock_in || !record.clock_out) return acc;
      
      const month = new Date(record.clock_in).toLocaleString('default', { month: 'long', year: 'numeric' });
      const hours = (new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime()) / (1000 * 60 * 60);
      
      if (!isNaN(hours) && hours > 0) {
        acc[month] = (acc[month] || 0) + hours;
      }
      
      return acc;
    }, {} as Record<string, number>);
  };

  // Show loading state while checking admin status or loading profile
  if (isAdminLoading || isProfileLoading) {
    return <LoadingSpinner />;
  }

  // Show error message if there was an error fetching the profile
  if (profileError) {
    return <ErrorCard onBack={() => navigate("/admin/dashboard")} />;
  }

  const monthlyHours = getMonthlyHours();

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
          <MonthlyHoursCard monthlyHours={monthlyHours} />
        </div>

        {!isTimeRecordsLoading && (
          timeRecords ? (
            <TimeRecordsTable 
              timeRecords={timeRecords} 
              username={profile?.username}
              onRecordsChange={refetchTimeRecords}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  No hay registros de tiempo para este usuario
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
};

export default UserDetails;
