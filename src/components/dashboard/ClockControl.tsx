
import { Clock, ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ClockControlProps {
  activeRecord: any;
  isLoading: boolean;
  onClockAction: () => void;
  CustomRecordDialog: React.ReactNode;
}

export const ClockControl = ({
  activeRecord,
  isLoading,
  onClockAction,
  CustomRecordDialog,
}: ClockControlProps) => {
  return (
    <div className="max-w-md mx-auto space-y-8 p-4">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="glass p-4 rounded-full">
            <Clock className="w-8 h-8 text-gray-700" />
          </div>
        </div>
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
            onClick={onClockAction}
            disabled={isLoading}
          >
            <ClockIcon className="mr-2" />
            {activeRecord ? "Registrar Salida" : "Registrar Entrada"}
          </Button>

          {CustomRecordDialog}
        </div>
      </div>
    </div>
  );
};
