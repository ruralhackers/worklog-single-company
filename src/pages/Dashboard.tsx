
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClockControl } from "@/components/dashboard/ClockControl";
import { CustomRecordDialog } from "@/components/dashboard/CustomRecordDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customNotes, setCustomNotes] = useState("");
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
            user_id: userId
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
            is_manual: true,
            notes: customNotes || null
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
            notes: customNotes || null,
            user_id: userId
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
      setCustomNotes("");
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
    setCustomNotes("");
    setCustomRecordType(type);
    setIsDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "¡Hasta pronto!",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <DashboardHeader userId={userId} onLogout={handleLogout} />
      <ClockControl
        activeRecord={activeRecord}
        isLoading={isLoading}
        onClockAction={handleClockAction}
        CustomRecordDialog={
          <CustomRecordDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            customDate={customDate}
            customTime={customTime}
            customNotes={customNotes}
            isLoading={isLoading}
            recordType={activeRecord ? "out" : "in"}
            onDateChange={setCustomDate}
            onTimeChange={setCustomTime}
            onNotesChange={setCustomNotes}
            onSubmit={handleCustomRecord}
            onCustomDialogOpen={openCustomDialog}
          />
        }
      />
    </div>
  );
};

export default Dashboard;
