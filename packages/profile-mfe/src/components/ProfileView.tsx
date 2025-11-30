// ProfileView.tsx
import { Profile } from "../types/profile.types";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

interface Props {
  profile: Profile;
}

export default function ProfileView({ profile }: Props) {
  return (
    <div className="profile-card">

      {/* Avatar minimal usando Lucide */}
      <div className="avatar-icon">
        <User size={80} strokeWidth={1.5} />
      </div>

      <h2>{profile.firstName} {profile.lastName}</h2>

      <p className="email">{profile.email}</p>

      {profile.age && <p className="age">Edad: {profile.age}</p>}

      <Link
        to="/profile/edit"
        style={{
          background: "red",
          color: "white",
          padding: "12px 0",
          width: "60%",
          display: "block",
          textAlign: "center",
          borderRadius: "6px",
          margin: "0 auto"
        }}
      >
        Editar Perfil
      </Link>
    </div>
  );
}
