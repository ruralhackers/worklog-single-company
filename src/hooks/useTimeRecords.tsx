
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
        const clockOut = new Date();
        const clockIn = new Date(activeRecord.clock_in);

        if (clockOut <= clockIn) {
          throw new Error("La hora de salida debe ser posterior a la hora de entrada");
        }

        const { error } = await supabase
          .from('time_records')
          .update({ 
            clock_out: clockOut.toISOString(),
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

  const handleCustomClockIn = async (
    customDate: string,
    customTime: string,
    customNotes: string,
  ) => {
    if (!userId || !customDate || !customTime) return;

    setIsLoading(true);
    try {
      const timestamp = new Date(`${customDate}T${customTime}`);

      const { error } = await supabase
        .from('time_records')
        .insert({
          clock_in: timestamp.toISOString(),
          user_id: userId,
          is_manual: true,
          notes: customNotes || null
        });

      if (error) throw error;

      toast({
        title: "¡Registro exitoso!",
        description: "Has registrado tu entrada personalizada correctamente.",
      });

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

  const handleCustomClockOut = async (
    customDate: string,
    customTime: string,
    customNotes: string,
  ) => {
    if (!userId || !customDate || !customTime) return;
    if (!activeRecord) {
      toast({
        title: "Error",
        description: "No hay un registro activo para registrar la salida",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const timestamp = new Date(`${customDate}T${customTime}`);
      const clockIn = new Date(activeRecord.clock_in);
      
      if (timestamp <= clockIn) {
        throw new Error("La hora de salida debe ser posterior a la hora de entrada");
      }

      const { error } = await supabase
        .from('time_records')
        .update({
          clock_out: timestamp.toISOString(),
          is_manual: true,
          notes: customNotes || null
        })
        .eq('id', activeRecord.id);

      if (error) throw error;

      toast({
        title: "¡Registro exitoso!",
        description: "Has registrado tu salida personalizada correctamente.",
      });

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
    if (customRecordType === "in") {
      await handleCustomClockIn(customDate, customTime, customNotes);
    } else {
      await handleCustomClockOut(customDate, customTime, customNotes);
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
