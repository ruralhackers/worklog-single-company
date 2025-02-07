
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Clock } from "lucide-react";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // To be implemented with Supabase
    toast({
      title: "Inicio de sesión pendiente",
      description: "La integración con Supabase aún no está implementada.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="glass p-4 rounded-full">
              <Clock className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Control de Fichaje
          </h2>
          <p className="text-sm text-gray-600">
            Inicia sesión para registrar tu jornada laboral
          </p>
        </div>

        <div className="glass p-8 space-y-6 animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                required
                className="input-field w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                required
                className="input-field w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="neo-button w-full">
              Iniciar sesión
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{" "}
              <a href="#" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                Contacta con soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
