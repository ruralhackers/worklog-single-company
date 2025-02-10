
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/pages/admin/UserDetails";

export const useUserProfile = (userId: string | undefined, isAdmin: boolean | undefined) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      console.log("Fetching profile for user:", userId);
      if (!userId) throw new Error("No user ID provided");

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

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
};
