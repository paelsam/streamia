import { useState } from "react";
import { changePassword } from "../services/userService";
import toast from "react-hot-toast";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNew) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await changePassword(oldPassword, newPassword);

      toast.success("Contraseña actualizada correctamente.");
      setOldPassword("");
      setNewPassword("");
      setConfirmNew("");

    } catch (err: any) {
      toast.error(err.message || "Error al cambiar la contraseña.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>

      <div style={{ marginBottom: 10 }}>
        <label>Contraseña Actual</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Nueva Contraseña</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Confirmar Nueva Contraseña</label>
        <input
          type="password"
          value={confirmNew}
          onChange={(e) => setConfirmNew(e.target.value)}
          required
        />
      </div>

      <button
        disabled={loading}
        style={{ background: "red", color: "white", padding: "8px 16px" }}
      >
        {loading ? "Guardando..." : "Actualizar Contraseña"}
      </button>
    </form>
  );
}
