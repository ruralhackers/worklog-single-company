
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al iniciar sesión.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
            Inicia sesión para comenzar
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="space-y-4">
              <Button type="submit" className="neo-button w-full" disabled={isLoading}>
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </Button>
              
              <div className="mt-6">
                <Link to="/signup">
                  <Button 
                    type="button" 
                    variant="outline"
                    className="w-full"
                  >
                    Crear cuenta nueva
                  </Button>
                </Link>
              </div>
            </div>
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
