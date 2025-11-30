import ProfileView from "../components/ProfileView";
import ProfileStats from "../components/ProfileStats";
import { useProfile } from "../hooks/useProfile";
import "../styles/profile.scss";

export default function ProfilePage() {
  const { profile, loading, error } = useProfile();

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>No profile data.</p>;

  return (
    <div className="profile-page">
      <div className="container">
        <ProfileView profile={profile} />
        <ProfileStats stats={profile.stats} />
      </div>
    </div>
  );
}
