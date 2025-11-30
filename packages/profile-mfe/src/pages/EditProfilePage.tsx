import EditProfileForm from "../components/EditProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import DeleteAccountModal from "../components/DeleteAccountModal";
import { useProfile } from "../hooks/useProfile";
import "../styles/edit-profile.scss";

export default function EditProfilePage() {
  const { profile, loading, error, refresh } = useProfile();

  if (loading) return <p className="text-center">Cargando...</p>;
  if (error) return <p className="text-center">{error}</p>;
  if (!profile) return <p className="text-center">No hay perfil</p>;

  return (
    <div className="edit-profile-page container">
      <div className="container">
        <div className="edit-form">
          <h2>Editar Perfil</h2>
          <EditProfileForm profile={profile} onUpdated={refresh} />
        </div>

        <div className="password-form">
          <h2>Cambiar Contraseña</h2>
          <ChangePasswordForm />
        </div>

        <div className="side-actions">
          <DeleteAccountModal onDeleted={() => window.location.href = "/"} />
        </div>
      </div>
    </div>
  );
}
