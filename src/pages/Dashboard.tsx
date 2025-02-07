
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, ClockIcon } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      checkActiveRecord();
    }
  }, [userId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    setUserId(session.user.id);
  };

  const checkActiveRecord = async () => {
    if (!userId) return;

    const { data: records, error } = await supabase
      .from('time_records')
      .select('*')
      .eq('user_id', userId)
      .is('clock_out', null)
      .order('clock_in', { ascending: false })
      .limit(1);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo verificar el estado actual",
        variant: "destructive",
      });
      return;
    }

    setActiveRecord(records?.[0] || null);
  };

  const handleClockAction = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      if (activeRecord) {
        // Clock out
        const { error } = await supabase
          .from('time_records')
          .update({ clock_out: new Date().toISOString() })
          .eq('id', activeRecord.id)
          .eq('user_id', userId);

        if (error) throw error;

        toast({
          title: "¡Registro exitoso!",
          description: "Has registrado tu salida correctamente.",
        });
      } else {
        // Clock in
        const { error } = await supabase
          .from('time_records')
          .insert({
            clock_in: new Date().toISOString(),
            user_id: userId
          });

        if (error) throw error;

        toast({
          title: "¡Registro exitoso!",
          description: "Has registrado tu entrada correctamente.",
        });
      }

      await checkActiveRecord();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al registrar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="glass p-4 rounded-full">
              <Clock className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Panel de Control
          </h1>
        </div>

        <div className="glass p-8 space-y-6">
          <div className="text-center space-y-4">
            <Button
              size="lg"
              className="w-full text-lg h-16"
              onClick={handleClockAction}
              disabled={isLoading}
            >
              <ClockIcon className="mr-2" />
              {activeRecord ? "Registrar Salida" : "Registrar Entrada"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {/* TODO: Implement custom time record */}}
            >
              Registro Personalizado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
