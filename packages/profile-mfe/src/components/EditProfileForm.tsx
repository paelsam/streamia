import { useState } from "react";
import { Profile } from "../types/profile.types";
import { updateUserProfile } from "../services/userService";

interface Props {
  profile: Profile;
  onUpdated: () => void;
}

export default function EditProfileForm({ profile, onUpdated }: Props) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile({ name, email });
      setMessage("Profile updated successfully");
      onUpdated();
    } catch (err: any) {
      setMessage(err?.response?.data?.error || "Something went wrong");
    }

    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 10 }}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}
