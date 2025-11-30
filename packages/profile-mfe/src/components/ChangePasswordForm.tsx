import { useState } from "react";
import { changePassword } from "../services/userService";

export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNew) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await changePassword(oldPassword, newPassword);
      setMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmNew("");
    } catch (err: any) {
      setMessage(err.message || "Error changing password");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Change Password</h3>

      <div style={{ marginBottom: 10 }}>
        <label>Current Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Confirm New Password</label>
        <input
          type="password"
          value={confirmNew}
          onChange={(e) => setConfirmNew(e.target.value)}
          required
        />
      </div>

      <button disabled={loading}>
        {loading ? "Saving..." : "Update Password"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
