
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCheck = () => {
  const navigate = useNavigate();

  return useQuery({
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
};
