import { Profile } from "../types/profile.types";
import { Link } from "react-router-dom";

interface Props {
  profile: Profile;
}

export default function ProfileView({ profile }: Props) {
  return (
    <div className="profile-card">
      <div className="avatar">
        <img
          src={profile.avatarUrl || "https://via.placeholder.com/120"}
          alt="avatar"
        />
      </div>

      <h2>{profile.name}</h2>
      <p className="email">{profile.email}</p>
      <p className="plan">Plan: {profile.subscriptionPlan}</p>

      <Link to="/edit" className="btn btn-primary">
        Editar Perfil
      </Link>
    </div>
  );
}