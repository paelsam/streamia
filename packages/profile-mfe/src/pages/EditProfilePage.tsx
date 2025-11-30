import EditProfileForm from "../components/EditProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { useProfile } from "../hooks/useProfile";

export default function EditProfilePage() {
  const { profile, loading, error, refresh } = useProfile();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!profile) return <p>No profile found</p>;

  return (
    <div>
      <h1>Edit Profile</h1>

      <EditProfileForm profile={profile} onUpdated={refresh} />

      <hr style={{ margin: "40px 0" }} />
      <ChangePasswordForm />

      <hr style={{ margin: "40px 0" }} />
      <DeleteAccountModal onDeleted={() => window.location.href = "/"} />
    </div>
  );
}