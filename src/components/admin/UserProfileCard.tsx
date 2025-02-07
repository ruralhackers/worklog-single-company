
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/pages/admin/UserDetails";

interface UserProfileCardProps {
  profile: UserProfile;
  userId: string;
  onProfileUpdate: () => void;
}

const UserProfileCard = ({ profile, userId, onProfileUpdate }: UserProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update username in profiles table
      if (username !== profile.username) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ username })
          .eq("id", userId);

        if (profileError) throw profileError;
      }

      // Update email and/or password if provided
      if (email || password) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        const { error: credentialsError } = await supabase.rpc(
          "update_user_credentials",
          {
            admin_uid: user.id,
            target_user_id: userId,
            new_email: email || null,
            new_password: password || null,
          }
        );

        if (credentialsError) throw credentialsError;
      }

      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente.",
      });

      setIsEditing(false);
      setPassword("");
      setEmail("");
      onProfileUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Información del Usuario</CardTitle>
        <Button
          variant="ghost"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isLoading}
        >
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre de usuario</dt>
              <dd>{profile.username || "Sin nombre de usuario"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Rol</dt>
              <dd>{profile.user_roles?.[0]?.role || "usuario"}</dd>
            </div>
          </dl>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Nuevo correo electrónico (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nuevo@correo.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña (opcional)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;

