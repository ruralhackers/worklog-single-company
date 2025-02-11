
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClockControl } from "@/components/dashboard/ClockControl";
import { CustomRecordDialog } from "@/components/dashboard/CustomRecordDialog";
import { useTimeRecords } from "@/hooks/useTimeRecords";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

const Dashboard = () => {
  const { toast } = useToast();
  const { userId, username, checkAuth, fetchUsername, handleLogout } = useUserProfile();
  const { isLoading, activeRecord, checkActiveRecord, handleClockAction, handleCustomRecord } = useTimeRecords(userId);
  
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customRecordType, setCustomRecordType] = useState<"in" | "out">("in");
  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      checkActiveRecord();
      fetchUsername();
      fetchRecentRecords();
    }
  }, [userId]);

  const fetchRecentRecords = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('time_records')
      .select('*')
      .eq('user_id', userId)
      .order('clock_in', { ascending: false })
      .limit(10);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros recientes",
        variant: "destructive",
      });
      return;
    }

    setRecentRecords(data || []);
  };

  const openCustomDialog = (type: "in" | "out") => {
    const now = new Date();
    setCustomDate(format(now, "yyyy-MM-dd"));
    setCustomTime(format(now, "HH:mm"));
    setCustomNotes("");
    setCustomRecordType(type);
    setIsDialogOpen(true);
  };

  const handleCustomRecordSubmit = async () => {
    await handleCustomRecord(customDate, customTime, customNotes, customRecordType);
    setIsDialogOpen(false);
    setCustomDate("");
    setCustomTime("");
    setCustomNotes("");
    // Actualizar los registros recientes después de añadir uno nuevo
    fetchRecentRecords();
  };

  const getWelcomeMessage = () => {
    if (activeRecord) {
      const clockInTime = format(new Date(activeRecord.clock_in), "HH:mm");
      return `Hola ${username || "usuario"}, has entrado a trabajar a las ${clockInTime}. Puedes registrar tu salida aquí`;
    }
    return `Hola ${username || "usuario"}, puedes registrar tu entrada aquí`;
  };

  const formatDuration = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return "En curso";
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <DashboardHeader userId={userId} onLogout={handleLogout} />
      <div className="container mx-auto pt-8 space-y-8 pb-8">
        <h2 className="text-center text-xl text-gray-700">
          {getWelcomeMessage()}
        </h2>
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
              recordType={customRecordType}
              onDateChange={setCustomDate}
              onTimeChange={setCustomTime}
              onNotesChange={setCustomNotes}
              onSubmit={handleCustomRecordSubmit}
              onCustomDialogOpen={openCustomDialog}
              activeRecord={activeRecord}
            />
          }
        />

        <div className="max-w-md mx-auto glass p-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">
            Últimos registros
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Duración</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.clock_in), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.clock_in), "HH:mm")}
                    </TableCell>
                    <TableCell>
                      {record.clock_out 
                        ? format(new Date(record.clock_out), "HH:mm")
                        : "En curso"}
                    </TableCell>
                    <TableCell>
                      {formatDuration(record.clock_in, record.clock_out)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No hay registros recientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
