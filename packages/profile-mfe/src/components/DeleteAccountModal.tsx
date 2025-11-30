import { useState } from "react";
import { deleteAccount } from "../services/userService";

interface Props {
  onDeleted: () => void;
}

export default function DeleteAccountModal({ onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setMessage("You must type DELETE to confirm");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      await deleteAccount();

      // Remove token, user is effectively logged out
      localStorage.removeItem("token");

      setMessage("Account deleted");
      setTimeout(() => onDeleted(), 1000);
    } catch (err: any) {
      setMessage(err.message || "Error deleting account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        style={{ background: "red", color: "white", padding: "8px 16px" }}
        onClick={() => setOpen(true)}
      >
        Delete Account
      </button>

      {open && (
        <div
          style={{
            background: "#00000055",
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 350,
            }}
          >
            <h3>Are you sure?</h3>
            <p>
              This action is <b>permanent</b>. All your data will be deleted.
            </p>

            <p>Type <b>DELETE</b> to confirm:</p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              style={{ width: "100%", marginBottom: 10 }}
            />

            {message && <p>{message}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button disabled={loading} onClick={handleDelete}>
                {loading ? "Deleting..." : "Confirm"}
              </button>

              <button onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
