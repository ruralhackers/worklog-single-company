
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTimeRecords = (userId: string | null) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeRecord, setActiveRecord] = useState<any>(null);

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

  const handleCustomRecord = async (
    customDate: string,
    customTime: string,
    customNotes: string,
    customRecordType: "in" | "out"
  ) => {
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

  return {
    isLoading,
    activeRecord,
    checkActiveRecord,
    handleClockAction,
    handleCustomRecord
  };
};
