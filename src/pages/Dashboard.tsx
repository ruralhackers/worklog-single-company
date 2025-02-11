
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ClockControl } from "@/components/dashboard/ClockControl";
import { CustomRecordDialog } from "@/components/dashboard/CustomRecordDialog";
import { useTimeRecords } from "@/hooks/useTimeRecords";
import { useUserProfile } from "@/hooks/useUserProfile";

const Dashboard = () => {
  const { toast } = useToast();
  const { userId, username, checkAuth, fetchUsername, handleLogout } = useUserProfile();
  const { isLoading, activeRecord, checkActiveRecord, handleClockAction, handleCustomRecord } = useTimeRecords(userId);
  
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
      fetchUsername();
    }
  }, [userId]);

  const openCustomDialog = (type: "in" | "out") => {
    const now = new Date();
    setCustomDate(format(now, "yyyy-MM-dd"));
    setCustomTime(format(now, "HH:mm"));
    setCustomNotes("");
    setCustomRecordType(type);
    setIsDialogOpen(true);
  };

  const handleCustomRecordSubmit = () => {
    handleCustomRecord(customDate, customTime, customNotes, customRecordType);
    setIsDialogOpen(false);
    setCustomDate("");
    setCustomTime("");
    setCustomNotes("");
  };

  const getWelcomeMessage = () => {
    if (activeRecord) {
      const clockInTime = format(new Date(activeRecord.clock_in), "HH:mm");
      return `Hola ${username || "usuario"}, has entrado a trabajar a las ${clockInTime}. Puedes registrar tu salida aquí`;
    }
    return `Hola ${username || "usuario"}, puedes registrar tu entrada aquí`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <DashboardHeader userId={userId} onLogout={handleLogout} />
      <div className="container mx-auto pt-8">
        <h2 className="text-center text-xl text-gray-700 mb-8">
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
      </div>
    </div>
  );
};

export default Dashboard;
