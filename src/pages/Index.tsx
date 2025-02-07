
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
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

  const validateUsername = async (username: string) => {
    if (!username) {
      setUsernameError("El nombre de usuario es requerido");
      return false;
    }
    
    const { data: existingUser, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      setUsernameError("Error al verificar el nombre de usuario");
      return false;
    }

    if (existingUser) {
      setUsernameError("Este nombre de usuario ya está en uso");
      return false;
    }

    setUsernameError(null);
    return true;
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

  const handleSignUp = async () => {
    setIsLoading(true);
    
    try {
      // Validate username first
      const isUsernameValid = await validateUsername(username);
      if (!isUsernameValid) {
        setIsLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        throw new Error("No se pudo crear el usuario");
      }

      // Update the username in the profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "¡Registro exitoso!",
        description: "Por favor, verifica tu correo electrónico.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al registrarse.",
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
            Inicia sesión o regístrate para comenzar
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
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                type="text"
                required
                className={`input-field w-full ${usernameError ? "border-red-500" : ""}`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError(null);
                }}
                placeholder="tunombredeusuario"
                disabled={isLoading}
              />
              {usernameError && (
                <p className="text-sm text-red-500">{usernameError}</p>
              )}
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
              
              <Button 
                type="button" 
                variant="outline"
                className="w-full"
                onClick={handleSignUp}
                disabled={isLoading}
              >
                Crear cuenta
              </Button>
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
