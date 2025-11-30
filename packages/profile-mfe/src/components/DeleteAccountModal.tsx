import { useState } from "react";
import { deleteAccount } from "../services/userService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useSharedStore } from "../../../shell/src/store/SharedStore";

interface Props {
  onDeleted: () => void;
}

export default function DeleteAccountModal({ onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { logout } = useSharedStore();
  const navigate = useNavigate();


  const handleDelete = async () => {
    if (confirmText !== "ELIMINAR") {
      toast.error("Debes escribir ELIMINAR para confirmar.");
      return;
    }

    if (!password) {
      toast.error("La contraseña es obligatoria.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await deleteAccount(password);

      localStorage.removeItem("token");

      toast.success("Cuenta eliminada correctamente.");

      logout();
      navigate('/login');

      setOpen(false);
      onDeleted();

    } catch (err: any) {
      toast.error(err.message || "Error eliminando la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        style={{ background: "red", color: "white", padding: "8px 16px", borderRadius: 6 }}
        onClick={() => setOpen(true)}
      >
        Eliminar Cuenta
      </button>

      {open && (
        <div
          style={{
            background: "rgba(0,0,0,0.6)",
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              color: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "420px",
              boxShadow: "0 0 25px rgba(0,0,0,0.4)",
            }}
          >
            <h2 style={{ marginBottom: 10 }}>¿Estás seguro?</h2>

            <p style={{ opacity: 0.9, marginBottom: 15 }}>
              Esta acción es <b>permanente</b>. Todos tus datos serán eliminados.
            </p>

            <p style={{ marginBottom: 6 }}>
              Escribe <b>ELIMINAR</b> para confirmar:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: 12,
                borderRadius: 6,
                border: "1px solid #333",
                background: "#111",
                color: "white",
              }}
            />

            <p style={{ marginBottom: 6 }}>Ingresa tu contraseña:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: 12,
                borderRadius: 6,
                border: "1px solid #333",
                background: "#111",
                color: "white",
              }}
            />

            {message && (
              <p style={{ color: "red", marginBottom: 10 }}>{message}</p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button
                disabled={loading}
                onClick={handleDelete}
                style={{
                  flex: 1,
                  background: "red",
                  color: "white",
                  padding: "10px 0",
                  borderRadius: 6,
                }}
              >
                {loading ? "Eliminando..." : "Confirmar"}
              </button>

              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  background: "#444",
                  color: "white",
                  padding: "10px 0",
                  borderRadius: 6,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
