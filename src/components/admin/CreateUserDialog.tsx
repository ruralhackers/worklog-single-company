
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateUserDialog = ({ open, onOpenChange }: CreateUserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

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
      // Validate username first
      const isUsernameValid = await validateUsername(username);
      if (!isUsernameValid) {
        setIsLoading(false);
        return;
      }

      // Create the user in Supabase Auth with username
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: `${username}@example.com`,
        password,
        options: {
          data: {
            username,
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error("No se pudo crear el usuario");

      // Get the current admin's session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No hay sesión de administrador");

      // Create or update profile with admin's session
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw new Error("Error al actualizar el perfil del usuario");
      }

      // If admin is selected, create admin role
      if (isAdmin) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: 'admin' })
          .eq("user_id", user.id);

        if (roleError) throw roleError;
      }

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });

      // Reset form and close dialog
      setUsername("");
      setPassword("");
      setIsAdmin(false);
      onOpenChange(false);

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error al crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(null);
              }}
              required
              className={usernameError ? "border-red-500" : ""}
            />
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="admin-mode"
              checked={isAdmin}
              onCheckedChange={setIsAdmin}
            />
            <Label htmlFor="admin-mode">¿Es administrador?</Label>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creando usuario..." : "Crear usuario"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
