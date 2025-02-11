
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Detectar si estamos en entorno de prueba usando la URL del proyecto
  const isTestEnvironment = import.meta.env.VITE_MODE !== 'production';

  useEffect(() => {
    checkAuth();

    if (isTestEnvironment) {
      toast({
        title: "🔬 Entorno de Prueba",
        description: "Esta es una versión de prueba. Los datos no se guardarán permanentemente.",
      });
    }
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
      console.log("1. Intentando login con username:", username);

      // First, get the user's email using their username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('username', username)
        .maybeSingle();

      console.log("2. Resultado búsqueda de perfil:", { profileData, profileError });

      if (profileError) {
        console.error("3. Error al buscar el perfil:", profileError);
        throw new Error('Error al buscar el usuario');
      }

      if (!profileData?.email) {
        console.error("4. No se encontró el email para el username:", username);
        throw new Error('Usuario no encontrado');
      }

      console.log("5. Intentando login con email:", profileData.email);

      // Now sign in with the email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profileData.email,
        password,
      });

      console.log("6. Resultado del login:", { data, error });

      if (error) {
        console.error("7. Error en login:", error);
        toast({
          title: "Error",
          description: "Usuario o contraseña incorrectos",
          variant: "destructive",
        });
      } else {
        if (isTestEnvironment) {
          toast({
            title: "✨ Inicio de sesión exitoso",
            description: "Recuerda que estás en el entorno de prueba",
          });
        } else {
          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión correctamente.",
          });
        }
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("8. Error general:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al iniciar sesión.",
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
          {isTestEnvironment && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                🔬 Estás usando la versión de prueba
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Usuario de prueba: <span className="font-medium">john</span>
              </p>
              <p className="text-xs text-yellow-600">
                Contraseña: <span className="font-medium">123456</span>
              </p>
            </div>
          )}
        </div>

        <div className="glass p-8 space-y-6 animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Nombre de usuario
              </Label>
              <Input
                id="username"
                type="text"
                required
                className="input-field w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario"
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

            <Button type="submit" className="neo-button w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Iniciar sesión"}
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
