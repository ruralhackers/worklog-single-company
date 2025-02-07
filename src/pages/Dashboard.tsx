
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, ClockIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customRecordType, setCustomRecordType] = useState<"in" | "out">("in");

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
          .update({ 
            clock_out: new Date().toISOString(),
            user_id: userId  // Ensure user_id is included
          })
          .eq('id', activeRecord.id);

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

  const handleCustomRecord = async () => {
    if (!userId || !customDate || !customTime) return;

    setIsLoading(true);
    try {
      const timestamp = new Date(`${customDate}T${customTime}`).toISOString();

      if (customRecordType === "in") {
        const { error } = await supabase
          .from('time_records')
          .insert({
            clock_in: timestamp,
            user_id: userId,
            is_manual: true
          });

        if (error) throw error;

        toast({
          title: "¡Registro exitoso!",
          description: "Has registrado tu entrada personalizada correctamente.",
        });
      } else {
        if (!activeRecord) {
          throw new Error("No hay un registro de entrada activo");
        }

        const { error } = await supabase
          .from('time_records')
          .update({ 
            clock_out: timestamp,
            is_manual: true,
            user_id: userId  // Ensure user_id is included
          })
          .eq('id', activeRecord.id);

        if (error) throw error;

        toast({
          title: "¡Registro exitoso!",
          description: "Has registrado tu salida personalizada correctamente.",
        });
      }

      setIsDialogOpen(false);
      setCustomDate("");
      setCustomTime("");
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

  const openCustomDialog = (type: "in" | "out") => {
    const now = new Date();
    setCustomDate(format(now, "yyyy-MM-dd"));
    setCustomTime(format(now, "HH:mm"));
    setCustomRecordType(type);
    setIsDialogOpen(true);
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

        {activeRecord && (
          <div className="glass p-4 rounded-lg text-center">
            <p className="text-gray-600">Hora de entrada:</p>
            <p className="text-lg font-semibold text-gray-800">
              {format(new Date(activeRecord.clock_in), "dd/MM/yyyy HH:mm:ss")}
            </p>
          </div>
        )}

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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => openCustomDialog(activeRecord ? "out" : "in")}
                >
                  Registro Personalizado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {customRecordType === "in" 
                      ? "Registro de Entrada Personalizado"
                      : "Registro de Salida Personalizado"
                    }
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleCustomRecord}
                    disabled={isLoading || !customDate || !customTime}
                  >
                    Guardar Registro
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
