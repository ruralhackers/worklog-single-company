
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
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

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate passwords
      if (!validatePasswords()) {
        setIsLoading(false);
        return;
      }

      // Validate username
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
      
      navigate('/');
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
            Crear una cuenta nueva
          </h2>
          <p className="text-sm text-gray-600">
            Regístrate para comenzar a usar la aplicación
          </p>
        </div>

        <div className="glass p-8 space-y-6 animate-slide-in">
          <form onSubmit={handleSignUp} className="space-y-6">
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
                className={`input-field w-full ${passwordError ? "border-red-500" : ""}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                className={`input-field w-full ${passwordError ? "border-red-500" : ""}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>

            <Button type="submit" className="neo-button w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
