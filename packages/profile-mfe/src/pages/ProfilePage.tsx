// ProfilePage.tsx
import ProfileView from "../components/ProfileView";
import ProfileStats from "../components/ProfileStats";
import { useProfile } from "../hooks/useProfile";
import "../styles/profile.scss";

export default function ProfilePage() {
  const { profile, loading, error } = useProfile();

  if (loading) return <p className="text-center">Cargando perfil...</p>;
  if (error) return <p className="text-center">{error}</p>;
  if (!profile) return <p className="text-center">No hay datos de perfil.</p>;

  return (
    <div className="profile-page container">
      <ProfileView profile={profile} />
      <ProfileStats stats={profile.stats} />
    </div>
  );
}
