
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ErrorCardProps {
  onBack: () => void;
}

const ErrorCard = ({ onBack }: ErrorCardProps) => {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Error al cargar los datos del usuario
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorCard;
