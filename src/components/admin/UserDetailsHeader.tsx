
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface UserDetailsHeaderProps {
  username: string | null;
  onBack: () => void;
}

const UserDetailsHeader = ({ username, onBack }: UserDetailsHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      <h1 className="text-2xl font-bold">
        Detalles del Usuario: {username || "Sin nombre de usuario"}
      </h1>
    </div>
  );
};

export default UserDetailsHeader;
