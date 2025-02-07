
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserProfile } from "@/pages/admin/UserDetails";

interface UserProfileCardProps {
  profile: UserProfile;
}

const UserProfileCard = ({ profile }: UserProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Usuario</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
