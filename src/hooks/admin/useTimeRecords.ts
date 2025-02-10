
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeRecord } from "@/pages/admin/UserDetails";
import { useToast } from "@/hooks/use-toast";

export const useTimeRecords = (userId: string | undefined, isAdmin: boolean | undefined) => {
  const { toast } = useToast();

  return useQuery({
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
};
