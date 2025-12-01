import { useState } from "react";
import { Profile } from "../types/profile.types";
import { updateUserProfile } from "../services/userService";
import toast from "react-hot-toast";

interface Props {
  profile: Profile;
  onUpdated: () => void;
}

export default function EditProfileForm({ profile, onUpdated }: Props) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [age, setAge] = useState(profile.age || 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile({ firstName, lastName, age });
      toast.success("Perfil actualizado correctamente.");
      onUpdated();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error al actualizar el perfil.");
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 10 }}>
        <label>Nombre</label>
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Apellido</label>
        <input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Edad</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </div>

      <button
        disabled={saving}
        style={{ background: "red", color: "white", padding: "8px 16px" }}
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
